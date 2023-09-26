import { BlobServiceClient } from '@azure/storage-blob';
import { ConflictException, Injectable } from '@nestjs/common';

@Injectable()
export class AssetsStorageService {
    private blobServiceClient: BlobServiceClient;

    constructor() {
        const connectionString = 'DefaultEndpointsProtocol=https;AccountName=onversed;AccountKey=rlnpXGQLD2YY5pnng7faQSHq7AFBA6ossNlvQQKdMBz4voc4eiQq6LVCyOUjmOBHsEVTx8JqQ/HF+AStEcrRBQ==;EndpointSuffix=core.windows.net';

        this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    }

    public async uploadFile(containerName: string, blobName: string, fileBuffer: Buffer, blobType: string): Promise<string> {
        containerName = containerName.replace(/_/g, '').replace(/-/g, '');
        await this.createContainer(containerName);

        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const response = await blockBlobClient.uploadData(fileBuffer, {
            blobHTTPHeaders: { blobContentType: blobType }
        });

        return response.requestId;
    }

    public async streamToBuffer(stream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks = [];

            stream.on('data', chunk => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
    }

    public async deleteFile(containerName: string, blobName: string): Promise<void> {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);

        const blobClient = containerClient.getBlobClient(blobName);

        try {
            await blobClient.delete();
        } catch (error) {
            throw new ConflictException('@ErrorNotValid');
        }
    }

    private async createContainer(containerName: string): Promise<void> {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);

        try {
            await containerClient.create({
                access: 'container'
            });
        } catch (error) {
            return;
        }
    }
}
