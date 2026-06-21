const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

const R2_ACCESS_KEY_ID = "6653be1a88c9d125ef53e165d8b16f49";
const R2_SECRET_ACCESS_KEY = "1204e565101ff1367ffe9038719e1266571548506133b787f3471af53c5647eb";
const R2_ENDPOINT = "https://0826b66c319f76e36528698729824137.r2.cloudflarestorage.com";
const R2_BUCKET = "lunacare-bucket";

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  try {
    const command = new PutBucketCorsCommand({
      Bucket: R2_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: [],
            MaxAgeSeconds: 3000
          }
        ]
      }
    });
    
    await s3Client.send(command);
    console.log("CORS configuration set successfully.");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
}

run();
