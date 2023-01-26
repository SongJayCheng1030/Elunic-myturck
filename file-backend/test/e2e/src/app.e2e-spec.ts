import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as exifr from 'exifr';
import * as fs from 'fs-extra';
import * as getPort from 'get-port';
import * as hasha from 'hasha';
import * as sizeOf from 'image-size';
import * as os from 'os';
import * as path from 'path';
import * as sharp from 'sharp';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import * as uuid from 'uuid';

describe('API', () => {
  let app: INestApplication;

  describe('Filesystem Storage', () => {
    let storedEnv: typeof process.env | undefined;

    let tmpFolder: string;
    let storagePath: string;
    let uploadPath: string;

    beforeAll(async () => {
      // Store current ENV
      storedEnv = { ...process.env };

      tmpFolder = path.join(os.tmpdir(), uuid.v4().substr(0, 13));
      uploadPath = path.join(tmpFolder, 'upload');
      await fs.ensureDir(uploadPath);
      storagePath = path.join(tmpFolder, 'storage');
      await fs.ensureDir(storagePath);

      process.env.APP_UPLOAD_TEMP_PATH = uploadPath;
      process.env.APP_STORAGE_ADAPTER = 'fs';
      process.env.APP_FS_STORAGE_PATH = storagePath;
    });

    afterAll(async () => {
      await fs.remove(tmpFolder);

      // Reset ENV after test series
      for (const key of Object.keys(process.env)) {
        delete process.env[key];
      }
      Object.assign(process.env, storedEnv);
      storedEnv = undefined;
    });

    defineTests();
  });

  describe('Azure Blob Storage', () => {
    let storedEnv: typeof process.env | undefined;

    let tmpFolder: string;
    let azuriteStoragePath: string;
    let localStoragePath: string;
    let uploadPath: string;
    let azurite: ChildProcessWithoutNullStreams;
    let azuriteClosePromise: Promise<void>;

    beforeAll(async () => {
      // Store current ENV
      storedEnv = { ...process.env };

      const port = await getPort();

      tmpFolder = path.join(os.tmpdir(), uuid.v4().substr(0, 13));
      uploadPath = path.join(tmpFolder, 'upload');
      await fs.ensureDir(uploadPath);
      azuriteStoragePath = path.join(tmpFolder, 'azurite');
      await fs.ensureDir(azuriteStoragePath);
      localStoragePath = path.join(tmpFolder, 'local');
      await fs.ensureDir(localStoragePath);

      process.env.APP_UPLOAD_TEMP_PATH = uploadPath;
      process.env.APP_STORAGE_ADAPTER = 'azblob';
      process.env.APP_AZ_USE_AZURITE = '1';
      // These are the Azurite default account credentials
      process.env.APP_AZ_BLOBSTORE_ACCOUNT = 'devstoreaccount1';
      process.env.APP_AZ_BLOBSTORE_ACCOUNTURL = `http://localhost:${port}/devstoreaccount1`;
      process.env.APP_AZ_BLOBSTORE_ACCOUNTKEY =
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==';
      process.env.APP_AZ_BLOBSTORE_CONTAINERNAME = 'e2e';
      process.env.APP_LOCAL_CACHE_FOLDER = localStoragePath;

      azurite = spawn(
        'azurite-blob',
        [
          '-s',
          '-l',
          azuriteStoragePath,
          '--blobHost',
          '0.0.0.0',
          '--blobPort',
          port.toString(),
          path.join(azuriteStoragePath, 'debug.log'),
        ],
        {
          cwd: azuriteStoragePath,
          // DO NOT USE SHELL, it will cause the SIGTERM/SIGKILL signals to NOT
          // be received by Azurite, preventing us from stopping the process.
          // shell: true,
        },
      );

      let azuriteStartResolve: () => void;
      let azuriteStartReject: (err: Error) => void;
      const azuriteStartPromise = new Promise<void>((resolve, reject) => {
        azuriteStartResolve = resolve;
        azuriteStartReject = reject;
      });

      let azuriteCloseResolve: () => void;
      let azuriteCloseReject: (err: Error) => void;
      azuriteClosePromise = new Promise<void>((resolve, reject) => {
        azuriteCloseResolve = resolve;
        azuriteCloseReject = reject;
      });

      // Don't pass Azurite output to console. Any errors should be handled by the application
      // and tested for. If you need to debug, comment the console.*() calls in,
      // but don't forget to comment them out again afterwards.
      azurite.stdout.on('data', data => {
        if (String(data).includes('Azurite Blob service successfully listens on')) {
          azuriteStartResolve();
        }
        // console.log(`azurite stdout: ${data}`);
      });
      // eslint-disable-next-line unused-imports/no-unused-vars-ts
      azurite.stderr.on('data', data => {
        // console.error(`azurite stderr: ${data}`);
      });
      azurite.on('error', err => {
        azuriteCloseReject(err);
      });
      azurite.on('close', (code, signal) => {
        if (code) {
          azuriteStartReject(
            new Error(`Azurite exited with an error: ${code} (signal: ${signal})`),
          );
          azuriteCloseReject(
            new Error(`Azurite exited with an error: ${code} (signal: ${signal})`),
          );
        } else {
          azuriteCloseResolve();
        }
      });

      let timeout: NodeJS.Timeout;
      await Promise.race([
        azuriteStartPromise.then(() => clearTimeout(timeout)),
        new Promise(
          (resolve, reject) =>
            (timeout = setTimeout(() => reject('Timed out waiting for Azurite to start'), 30000)),
        ),
      ]);
    });

    afterAll(
      async () => {
        azurite.kill('SIGTERM');
        await azuriteClosePromise;

        await fs.remove(tmpFolder);

        // Reset ENV after test series
        for (const key of Object.keys(process.env)) {
          delete process.env[key];
        }
        Object.assign(process.env, storedEnv);
        storedEnv = undefined;
      },
      // Give Azurite time to shut down.
      30000,
    );

    defineTests();
  });

  function defineTests() {
    describe('Upload/Download files', () => {
      beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
          imports: [AppModule.forE2E()],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await app.close();
      });

      const binaryLocalFilepath = path.join(process.cwd(), '/test/fixtures/excel.xlsx');
      const binaryLocalHash = hasha.fromFileSync(binaryLocalFilepath, { algorithm: 'md5' });
      let binaryFileId: string;

      it('should accept a binary file upload', async () => {
        const uploadResponse = await request(app.getHttpServer())
          .post(`/v1/file`)
          .attach('file', binaryLocalFilepath)
          .expect(201);

        binaryFileId = uploadResponse.body.data.id;
      });

      it('should allow the binary file to be downloaded', async () => {
        const response = await request(app.getHttpServer())
          .get(`/v1/file/${binaryFileId}`)
          .expect(200)
          .expect(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
          .responseType('blob');

        const responseHash = await hasha.async(response.body, { algorithm: 'md5' });
        expect(responseHash).toBe(binaryLocalHash);
      });

      it('should allow the binary file metadata to be downloaded', async () => {
        const response = await request(app.getHttpServer()).get(`/v1/meta/${binaryFileId}`);

        expect(response.body).toEqual({
          data: {
            id: binaryFileId,
            isImage: false,
            mimeType: ['application', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            mimeTypeRaw: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            name: 'excel.xlsx',
            md5: binaryLocalHash,
          },
          meta: {},
        });
      });

      it('should allow the binary file to be copied, and the copied file should be downloadable and be the same', async () => {
        const copyResponse = await request(app.getHttpServer()).get(`/v1/copy/${binaryFileId}`);
        const copiedId = copyResponse.body.data.id;

        const response = await request(app.getHttpServer())
          .get(`/v1/file/${copiedId}`)
          .expect(200)
          .expect(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          )
          .responseType('blob');

        const responseHash = await hasha.async(response.body, { algorithm: 'md5' });
        expect(responseHash).toBe(binaryLocalHash);
      });

      it('should allow deletion of the binary file and the file should not be available afterwards', async () => {
        await request(app.getHttpServer()).delete(`/v1/file/${binaryFileId}`).expect(204);
        await request(app.getHttpServer()).get(`/v1/file/${binaryFileId}`).expect(404);
      });

      const imageLocalFilepath = path.join(process.cwd(), '/test/fixtures/image.png');
      let imageFileId: string;

      it('should accept an image file upload', async () => {
        const uploadResponse = await request(app.getHttpServer())
          .post(`/v1/file`)
          .attach('file', imageLocalFilepath)
          .expect(201);

        imageFileId = uploadResponse.body.data.id;
      });

      it('should allow the image file to be downloaded', async () => {
        const response = await request(app.getHttpServer())
          .get(`/v1/file/${imageFileId}`)
          .expect(200)
          .expect('Content-Type', 'image/png')
          .responseType('blob');

        const responseHash = await hasha.async(response.body, { algorithm: 'md5' });
        const localHash = await hasha.fromFile(imageLocalFilepath, { algorithm: 'md5' });
        expect(responseHash).toBe(localHash);
      });

      it('should allow thumbnail generation for image with w & h query', async () => {
        const thumbnailWidth = 240;
        const thumbnailHeight = 200;
        const response = await request(app.getHttpServer())
          .get(`/v1/image/${imageFileId}?w=${thumbnailWidth}&h=${thumbnailHeight}&fit=contain`)
          .expect(200)
          .expect('Content-Type', 'image/png');

        const output = await exifr.parse(response.body);
        expect(output.ImageWidth).toBe(thumbnailWidth);
        expect(output.ImageHeight).toBe(thumbnailHeight);
      });

      it('should switch JPEG rotation by EXIF information', async () => {
        const jpegImageLocalFilepath = path.join(process.cwd(), '/test/fixtures/portrait_5.jpg');

        const output = await exifr.orientation(jpegImageLocalFilepath);
        expect(output).toBe(5);

        const uploadResponse = await request(app.getHttpServer())
          .post(`/v1/file`)
          .attach('file', jpegImageLocalFilepath)
          .expect(201);

        const response = await request(app.getHttpServer())
          .get(`/v1/image/${uploadResponse.body.data.id}`)
          .expect(200)
          .expect('Content-Type', 'image/jpeg');

        const dimensionsOrigin = sizeOf.imageSize(jpegImageLocalFilepath);
        const dimensionsUploaded = sizeOf.imageSize(response.body);

        expect(dimensionsUploaded.width).toBe(dimensionsOrigin.height);
        expect(dimensionsUploaded.height).toBe(dimensionsOrigin.width);
      });

      it('should return placeholder image on image not found', async () => {
        const invalidImageId = '0664da2d-c4d7-4d09-b877-0d19396f18de';
        const response = await request(app.getHttpServer())
          .get(`/v1/image/${invalidImageId}`)
          .expect(200)
          .expect('Content-Type', 'image/png');

        const responseHash = await hasha.async(response.body, { algorithm: 'md5' });
        const localBuf = await _getSharpIcon('_no-image.png');
        const localHash = await hasha.async(localBuf, { algorithm: 'md5' });
        expect(responseHash).toBe(localHash);
      });

      it('should return Content-Disposition settings for image', async () => {
        await request(app.getHttpServer())
          .get(`/v1/file/${imageFileId}`)
          .expect(200)
          .expect('Content-Disposition', 'attachment; filename="image.png"');
      });
    });
  }

  async function _getSharpIcon(name: string): Promise<Buffer> {
    const buf = await fs.readFile(path.join(process.cwd(), `/icons/${name}`));
    return await sharp(buf).toBuffer();
  }
});
