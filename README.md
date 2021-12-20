# Infrontier

> Powered by [electron-nuxt](https://github.com/michalzaq12/electron-nuxt).

A simple AWS S3 client written with Electron. Designed for personal use.

![preview](img/1.png)

## Features

- File content preview.
  - CSV.
  - JPEG/PNG.
  - Other text format.
- **Resumable** multipart upload/download.
  - Even if you close this application by accident, you can resume multipart upload/download next time.
- View pending tasks & cancel task.
  - You can only cancel tasks that are not running.
  - You can stop tasks by close this application.
- Drag file to upload.

## Setup

Before you start, you will need an AWS account, and an existing S3 bucket.

> Infrontier is a bucket level application so it can't help you to create S3 buckets.

Then you need to configure AWS credentials (AccessKeyId & SecretAccessKey) on your local computer.

> For example, you can use AWS CLI to configure credentials:
>
> 1. [Create your AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds).
> 2. [Download & install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
> 3. Run `aws configure` in your favorite terminal and input your AccessKeyId & SecretAccessKey.
>
> For detailed info, see [AWS doc](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).

After AWS credentials configured, run Infrontier and click `Settings` button to configure it.

## Build Setup

```bash
# install dependencies
yarn install

# serve app with hot reload
yarn dev

# build electron application for production
yarn build
```

## [CHANGELOG](https://github.com/DiscreteTom/Infrontier/blob/main/CHANGELOG.md)
