import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
    DeleteObjectsCommand
} from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME;
const REGION = process.env.NEXT_PUBLIC_AWS_SES_REGION;
const ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY;
const SECRET_KEY = process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY;

// Initialize S3 client
const s3 = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

/**
 * Ensure the folder exists by uploading a placeholder file
 * @param section - The section folder (e.g., "carousel", "banners")
 * @param shippingLineId - The shipping line folder (e.g., "2", "5")
 */

export const uploadToS3 = async (
    file: Buffer, // Ensure it’s a Buffer, not base64
    mimetype: string, // Pass the file type explicitly
    section: string,
    shippingLineId: string,
    filename: string
): Promise<string> => {
    if (!section) {
        throw new Error("Section is required.");
    }

    const folderPath = `${section.toLowerCase()}/${shippingLineId}/`;
    const fileKey = `${folderPath}${filename}`;

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Body: file, // Use file buffer directly
            ContentType: mimetype, // Ensure correct file type
        };

        await s3.send(new PutObjectCommand(params));

        return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw new Error("File upload failed.");
    }
};

/**
 * Get a list of files from an S3 bucket folder
 * @param section - The section folder (e.g., "carousel", "banners")
 * @param shippingLineId - The shipping line folder (optional)
 * @returns A list of file keys (paths) in the folder
 */
export const listFilesInS3 = async (
    section: string,
    shippingLineId?: string
): Promise<string[]> => {
    const folderPath = shippingLineId ? `${section.toLowerCase()}/${shippingLineId}/` : `${section}/`;

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: folderPath, // Only list files under this folder
        };

        const listedObjects = await s3.send(new ListObjectsV2Command(params));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            return [];
        }

        return listedObjects.Contents.map((item) => item.Key!); // Return the list of file keys
    } catch (error) {
        console.error("Error listing files in S3:", error);
        throw new Error("Failed to list files.");
    }
};

/**
 * Delete a file from S3
 * @param section - The section folder (e.g., "carousel", "banners")
 * @param shippingLineId - The shipping line folder (optional)
 * @param fileName - The name of the file to delete
 */
export const deleteFileFromS3 = async (
    section: string,
    fileName: string,
    shippingLineId?: string
): Promise<void> => {
    if (!section || !fileName) {
        throw new Error("Section and fileName are required.");
    }

    const filePath = shippingLineId ? `${section.toLowerCase()}/${shippingLineId}/${fileName}` : `${section}/${fileName}`;

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath,
        };

        await s3.send(new DeleteObjectCommand(params));
        console.log(`File deleted: ${filePath}`);
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw new Error("File deletion failed.");
    }
};

/**
 * Delete all files from a specific S3 folder
 * @param section - The section folder (e.g., "carousel", "banners")
 * @param shippingLineId - The shipping line folder (optional)
 */
export const deleteAllFilesFromS3 = async (
    section: string,
    shippingLineId?: string
): Promise<void> => {
    if (!section) {
        throw new Error("Section is required.");
    }

    const folderPath = shippingLineId ? `${section}/${shippingLineId}/` : `${section}/`;

    try {
        // List all files in the folder
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: folderPath,
        };

        const listedObjects = await s3.send(new ListObjectsV2Command(params));

        if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
            console.log(`No files found in ${folderPath}`);
            return;
        }

        // Delete each file
        const deleteParams = {
            Bucket: BUCKET_NAME,
            Delete: {
                Objects: listedObjects.Contents.map((item) => ({ Key: item.Key! })),
            },
        };

        await s3.send(new DeleteObjectsCommand(deleteParams));
        console.log(`All files deleted from ${folderPath}`);
    } catch (error) {
        console.error("Error deleting all files from S3:", error);
        throw new Error("Failed to delete all files.");
    }
};
