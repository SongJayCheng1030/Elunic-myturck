shopfloor.io file service

## Storage adapters

The file service supports different storage adapters to save files to. The adapter can be set using `APP_STORAGE_ADAPTER`. Currently available adapters are:

- `azblob`: Azure Storage Container (**default**)
  - Files are written to an Azure Blob Store containers; the configuration shown below can be applied, env variables `APP_AZ_BLOBSTORE_ACCOUNT`, `APP_AZ_BLOBSTORE_ACCOUNTURL`, `APP_AZ_BLOBSTORE_ACCOUNTKEY`, `APP_AZ_BLOBSTORE_CONTAINERNAME` are relevant; see documentation.
  - When using `azblob`, `APP_FS_STORAGE_PATH` can be used to set the temporary cache folder path.
  - When using Azurite for development (see below), set `APP_AZ_USE_AZURITE=1`
- `fs`: local filesystem
  - Files are written to the file system. Use `APP_FS_STORAGE_PATH` to define the directory (see below)

In order to use one of those, set the env var `APP_STORAGE_ADAPTER` to either `azblob` value or `fs` value. By default `azblob` is already set.

## Developing

Run `npm run dev` to start the local development server.

To develop for Azure storage, set the appropriate ENV variables, for example using an `.env` file in the service root (will not be comitted) with the following contents:

    APP_STORAGE_ADAPTER=azblob
    APP_AZ_BLOBSTORE_ACCOUNT=azure_blob_store
    APP_AZ_BLOBSTORE_ACCOUNTKEY=security_token
    APP_AZ_BLOBSTORE_CONTAINERNAME=azure_blob_store_container
    APP_AZ_BLOBSTORE_ACCOUNTURL=https://azure_blob_store.blob.core.windows.net (optional, the default is https://<account>.blob.core.windows.net)

Alternatively you can use the npm module `azurite` which wills start parallel with `npm run dev:azblob` and runs a local azure storage instance in the `data/azurite/` folder. If the `APP_AZ_USE_AZURITE=1` is set, the service will use azurite. Set these default values in your `.env` file to connect to the local blob storage:

    APP_STORAGE_ADAPTER=azblob
    APP_AZ_USE_AZURITE=1
    APP_AZ_BLOBSTORE_ACCOUNT=devstoreaccount1
    APP_AZ_BLOBSTORE_ACCOUNTKEY=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
    APP_AZ_BLOBSTORE_CONTAINERNAME=container-name

You can replace `container-name` with any value you would like, the container will be setup for you automatically.

## Environment variables

- `APP_PORT` (default: `8080`)
- `LOG_LEVEL` (default: 'info')
- `APP_STORAGE_ADAPTER`/`APP_FILESERVICE_STORAGE_ADAPTER` the storage adapter (default: `azblob`)
- `APP_LOCAL_CACHE_PATH` the path to the local cache folder, used to cache remote files and transformed images (default: `/data/localcache/`)
- `APP_UPLOAD_TEMP_PATH` path to a local folder to be used as upload destination for file uploades (default: `/tmp/`)

### `azblob` storage:

- `APP_AZ_BLOBSTORE_ACCOUNT`
- `APP_AZ_BLOBSTORE_ACCOUNTURL` (defaults to `https://<account>.blob.core.windows.net`)
- `APP_AZ_BLOBSTORE_ACCOUNTKEY`
- `APP_AZ_BLOBSTORE_CONTAINERNAME`
- `APP_AZ_USE_AZURITE` set this to `1` when using Azurite to auto-create the container

### `fs`

- `APP_FS_STORAGE_PATH`/`APP_FILESERVICE_FS_STORAGE_PATH` (default: `/data/files/` on `production`, `./data/files/` otherwise)

## Docker shell

To drop into a shell inside a Docker container, run:

`npm run shell`

Inside the shell, the `ng` command will be available inside, you will be in the project root,
and all `npm` scripts (such as `npm run dev`) will be available.

### Description (German)

Dieser Microservice kümmert sich nur um das Hochladen & Bereitstellen von Dateien
aus Storage-Adaptern und abstrahiert diese. Aktuell werden die folgenden Routen unterstützt:

1.) `GET /v1/image/:fileId`
wobei `fileId` der File-ID entspricht. Besonderheit: wenn man diese Funktion aufruft, bekommt man eine Bilddatei, egal um was für ein File es sich handelt. Ist das File ein Bild, bekommt man das Bild. Ist das File kein Bild (z.B. ZIP-Datei) bekommt man ein File-Icon zu diesem File mit max 512x512 Pixeln. Wenn die Datei nicht existiert, dann bekommt man ein Bild, dass ein kaputtes File darstellt.
Außerdem kann man die URL-GET-Parameter `w` & `h` angeben, um das Bild in einer bestimmten Größe anzuzeigen. Wenn die Aspect-Ratio von `w` und `h` nicht zum originalen Bild passt, dann kann man mit `fit` noch folgende Optionen angeben: `'cover', 'contain', 'fill', 'inside', 'outside'`. Der Hintergrund wird mit weiß gefüllt.

2.) `GET /v1/file/:fileId`
wobei `fileId` der File-ID entspricht. Fragt eine Datei ab. Egal ob Bild oder nicht, man bekommt die Datei, standardmäßig zum Download mit dem originalen File-Name als Download-Namen. Wenn man den URL GET Parameter `disposition=inline` angibt, bekommt man das Bild als Inline-Response (d.h. kein Download-Fenster). Existiert das Bild nicht, bekommt man einen 404.

3.) `DELETE /v1/file/:fileId`
wobei `fileId` der File-ID entspricht. Löscht das Bild. Bei Erfolg gibt es HTTP 204 zurück.

4.) `POST /v1/file`
lädt eine neue Datei per `form-data` MIME hoch auf dem Feld `file`. Als Rückgabewert bekommt man die vollständige URL des Bildes und HTTP 200:

    {
       "data": {
           "url": "http://asm_dev.adamos.com/v1/file/47428"
       },
       "meta": {}
    }
