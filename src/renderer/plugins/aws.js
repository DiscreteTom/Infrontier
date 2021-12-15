import { S3Client } from "@aws-sdk/client-s3";

let aws = {};

function configure({ accessKeyId, secretAccessKey, region }) {
  aws["s3"] = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region,
  });
}

aws["configure"] = configure;

export default (context, inject) => {
  inject("aws", aws);
};
