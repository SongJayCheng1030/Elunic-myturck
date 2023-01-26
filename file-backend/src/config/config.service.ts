import { LogLevels } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import * as Joi from 'joi';
import * as path from 'path';
import { AbstractConfigService, AbstractConfigServiceSchema } from 'shared/backend';

import { switchEnv } from './switchEnv';

dotenvExpand(dotenv.config());

const CONFIG_SCHEMA = AbstractConfigServiceSchema.keys({
  httpPort: Joi.number().integer().min(1).max(65535).required(),

  userServiceUrl: Joi.string().uri().required(),

  database: Joi.object().keys({
    host: Joi.string().required(),
    port: Joi.number().integer().greater(0).required(),
    user: Joi.string().required(),
    pass: Joi.string().required(),
    name: Joi.string().required(),
    ssl: Joi.boolean().required(),
  }),

  uploadTempPath: Joi.string().required(),
  storageAdapter: Joi.string().valid('azblob', 'fs').required(),

  localCache: Joi.when('storageAdapter', {
    // Add other adapters if they require configuration for the local cache
    is: Joi.string().valid('azblob').required(),
    then: Joi.object({
      folderPath: Joi.string().required(),
    })
      .unknown(false)
      .required(),
    otherwise: Joi.any(),
  }).required(),

  localFs: Joi.when('storageAdapter', {
    is: 'fs',
    then: Joi.object({
      storagePath: Joi.string().min(1).required(),
    })
      .unknown(false)
      .required(),
    otherwise: Joi.any(),
  }).required(),

  azBlob: Joi.when('storageAdapter', {
    is: 'azblob',
    then: Joi.object({
      useAzurite: Joi.boolean().required(),
      credentials: Joi.object()
        .required()
        .keys({
          account: Joi.string().required(),
          accountUrl: Joi.string().uri().required(),
          accountKey: Joi.string().required(),
          containerName: Joi.string().required(),
        })
        .unknown(false),
    })
      .unknown(false)
      .required(),
    otherwise: Joi.any(),
  }).required(),

  maxUploadFileSize: Joi.number().integer().min(1).required(),
  browserCacheDurationSecs: Joi.number().integer().min(1).required(),
  fileCacheDurationSecs: Joi.number().integer().min(1).required(),
  maxImageSize: Joi.number().integer().min(1).max(8192).required(),

  iconsBaseDir: Joi.string().min(1).required(),

  staticImage: Joi.object({
    filename: Joi.string().min(1).required(),
    absPath: Joi.string().min(1).required(),
    mime: Joi.string().min(1).required(),
  }).required(),
  getNoFileImage: Joi.object({
    filename: Joi.string().min(1).required(),
    absPath: Joi.string().min(1).required(),
    mime: Joi.string().min(1).required(),
  }).required(),
  blankImage: Joi.object({
    filename: Joi.string().min(1).required(),
    absPath: Joi.string().min(1).required(),
    mime: Joi.string().min(1).required(),
  }).required(),

  allowedFileTypes: Joi.array().items(Joi.string().min(1)).min(1).required(),
  thumbnailFileIcons: Joi.array().items(Joi.string().min(1)).min(1).required(),

  openApiDocs: Joi.object()
    .keys({
      auth: Joi.object()
        .keys({
          enabled: Joi.boolean().required(),
          username: Joi.when('enabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.any(),
          }).required(),
          password: Joi.when('enabled', {
            is: true,
            then: Joi.string().required(),
            otherwise: Joi.any(),
          }).required(),
        })
        .required(),
    })
    .required(),

  log: Joi.object().keys({
    json: Joi.boolean().required(),
    consoleLevel: Joi.string()
      .allow(...Object.values(LogLevels))
      .only()
      .required(),
    namespace: Joi.string().required(),
  }),
});

@Injectable()
export class ConfigService extends AbstractConfigService {
  constructor() {
    super();

    // DO NOT REMOVE THIS VALIDATION CHECK.
    // Check moved to constructor to only run when a config object is actually
    // created. Running it at the end of the file would throw errors in
    // E2E/API settings, where some variables are defined just prior to test
    // execution (beforeAll() etc.)
    Joi.assert(this, CONFIG_SCHEMA, 'Invalid configuration');
  }

  httpPort = switchEnv(
    {
      development: 13003,
    },
    Number(process.env.APP_PORT || process.env.APP_PORT_FILE) || 8080,
  );

  userServiceUrl = switchEnv(
    {
      e2e: 'http://user-service/',
    },
    String(process.env.APP_SERVICE_URL_USER || ''),
  );

  database = switchEnv(
    {
      testing: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
      e2e: {
        host: process.env.APP_TEST_DB_HOST || '',
        port: Number(process.env.APP_TEST_DB_PORT) || 3306,
        user: process.env.APP_TEST_DB_USER || '',
        pass: process.env.APP_TEST_DB_PASS || '',
        name: process.env.APP_TEST_DB_NAME || '',
        ssl: false,
      },
    },
    {
      host: process.env.APP_DB_HOST || 'localhost',
      port: Number(process.env.APP_DB_PORT) || 3306,
      user: process.env.APP_DB_USER || 'root',
      pass: process.env.APP_DB_PASS || '123456',
      name: process.env.APP_DB_NAME || 'shopfloor_tenant',
      ssl: [1, '1', true, 'true'].includes(process.env.APP_DB_SSL || ''),
    },
  );

  /**
   * The folder into which files are uploaded by multer. This is NOT used as any kind
   * of permanent storage folder.
   */
  uploadTempPath = switchEnv(
    {
      production: process.env.APP_UPLOAD_TEMP_PATH || '/tmp/',
    },
    process.env.APP_UPLOAD_TEMP_PATH || path.join(process.cwd(), 'data/uploadtmp/'),
  );

  // APP_FILESERVICE_STORAGE_ADAPTER is meant for the Dockershell only
  storageAdapter =
    process.env.APP_STORAGE_ADAPTER || process.env.APP_FILESERVICE_STORAGE_ADAPTER || 'azblob';

  /**
   * Used as local cache folder for:
   * - transformed images
   * - "remote" adapters (e.g. azblob), so that files can be accessed locally
   */
  localCache = {
    folderPath: switchEnv(
      {
        production: process.env.APP_LOCAL_CACHE_PATH || '/data/localcache/',
      },
      process.env.APP_LOCAL_CACHE_PATH || path.join(process.cwd(), 'data/localcache/'),
    ),
  };

  localFs = {
    /**
     * Folder path where files should actually be stored when using the "fs" adapter.
     */
    storagePath: switchEnv(
      {
        production: process.env.APP_FS_STORAGE_PATH || '/data/files/',
      },
      // APP_FILESERVICE_FS_STORAGE_PATH is meant for the Dockershell only
      process.env.APP_FS_STORAGE_PATH ||
        process.env.APP_FILESERVICE_FS_STORAGE_PATH ||
        path.join(process.cwd(), 'data/files/'),
    ),
  };

  azBlob = {
    useAzurite: [1, '1', true, 'true'].includes(
      // APP_FILESERVICE_AZ_USE_AZURITE is meant for the Dockershell only
      process.env.APP_AZ_USE_AZURITE || process.env.APP_FILESERVICE_AZ_USE_AZURITE || '0',
    ),

    // This getter-based setup enables default values in case Azurite should be used, but
    // still takes ENVs into account
    // The values used in the Azurite case are the default values for the default container
    // created by Azurite.
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    get credentials() {
      const useAzurite = this.useAzurite;
      return {
        get account(): string {
          return process.env.APP_AZ_BLOBSTORE_ACCOUNT || (useAzurite ? `devstoreaccount1` : ``);
        },
        get accountUrl(): string {
          return (
            process.env.APP_AZ_BLOBSTORE_ACCOUNTURL ||
            (useAzurite
              ? `http://0.0.0.0:10000/${this.account}`
              : `https://${this.account}.blob.core.windows.net`)
          );
        },
        get accountKey(): string {
          return (
            process.env.APP_AZ_BLOBSTORE_ACCOUNTKEY ||
            (useAzurite ? `Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq` : ``)
          );
        },
        get containerName(): string {
          return process.env.APP_AZ_BLOBSTORE_CONTAINERNAME || (useAzurite ? `dev` : ``);
        },
      };
    },
  };

  maxUploadFileSize = Number(process.env.APP_MAX_FILE_SIZE) || 20 * 1048576;

  iconsBaseDir = path.join(process.cwd(), '/icons/');

  browserCacheDurationSecs = 60;

  fileCacheDurationSecs = 30;

  openApiDocs = {
    auth: {
      enabled: switchEnv(
        {
          development: false,
          testing: false,
          e2e: false,
        },
        [1, '1', true, 'true'].includes(process.env.APP_OPENAPIDOCS_AUTH_DISABLED || '')
          ? false
          : true,
      ),
      username:
        process.env.APP_OPENAPIDOCS_AUTH_USERNAME ||
        'default' + (Math.random() + 1).toString(36).substring(2),
      password:
        process.env.APP_OPENAPIDOCS_AUTH_PASSWORD ||
        'default' + (Math.random() + 1).toString(36).substring(2),
    },
  };

  log = {
    namespace: 'app',
    ...switchEnv(
      {
        e2e: {
          json: false,
          consoleLevel: LogLevels.Silent,
        },
        production: {
          json: false,
          consoleLevel: (process.env.LOG_LEVEL as LogLevels) || LogLevels.Info,
        },
      },
      {
        json: false,
        consoleLevel: (process.env.LOG_LEVEL as LogLevels) || LogLevels.Debug,
      },
    ),
  };

  staticImage = {
    filename: 'broken-image.png',
    absPath: path.join(this.iconsBaseDir, '_broken-image.png'),
    mime: 'image/png',
  };
  getNoFileImage = {
    filename: 'no-image.png',
    absPath: path.join(this.iconsBaseDir, '_no-image.png'),
    mime: 'image/png',
  };
  blankImage = {
    filename: 'blank.png',
    absPath: path.join(this.iconsBaseDir, '_blank.png'),
    mime: 'image/png',
  };

  /**
   * Maximum scaling size of images in pixels
   */
  maxImageSize = 1600;

  /**
   * List of allowed upload file extensions
   */
  allowedFileTypes = [
    'jpeg',
    'jpg',
    'png',
    'gif',
    'webp',
    'flif',
    'tif',
    'tiff',
    'bmp',
    'zip',
    'tar',
    'gz',
    'bz2',
    '7z',
    'mp4',
    'mkv',
    'webm',
    'mov',
    'avi',
    'mp3',
    'wav',
    'pdf',
    'rtf',
    'docx',
    'pptx',
    'xlsx',
    'doc',
    'ppt',
    'xls',
    'jp2',
    'jpm',
    'jpx',
    'odt',
    'ods',
    'odp',
    'xml',
    'ics',
    'txt',
    'log',
    'json',
    'xml',
    'svg',
    'jfif',
  ];

  /**
   * **(RO)** all available thumbnail icons
   */
  thumbnailFileIcons = [
    'aac.png',
    'ai.png',
    'aiff.png',
    'avi.png',
    'bmp.png',
    'c.png',
    'cpp.png',
    'css.png',
    'csv.png',
    'dat.png',
    'dmg.png',
    'doc.png',
    'dotx.png',
    'dwg.png',
    'dxf.png',
    'eps.png',
    'exe.png',
    'flv.png',
    'gif.png',
    'h.png',
    'hpp.png',
    'html.png',
    'ics.png',
    'iso.png',
    'java.png',
    'jpg.png',
    'js.png',
    'key.png',
    'less.png',
    'mid.png',
    'mp3.png',
    'mp4.png',
    'mpg.png',
    'odf.png',
    'ods.png',
    'odt.png',
    'otp.png',
    'ots.png',
    'ott.png',
    'pdf.png',
    'php.png',
    'png.png',
    'ppt.png',
    'psd.png',
    'py.png',
    'qt.png',
    'rar.png',
    'rb.png',
    'rtf.png',
    'sass.png',
    'scss.png',
    'sql.png',
    'tga.png',
    'tgz.png',
    'tiff.png',
    'txt.png',
    'wav.png',
    'xls.png',
    'xlsx.png',
    'xml.png',
    'yml.png',
    'zip.png',
  ];
}
