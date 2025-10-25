/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file storage.interface.ts — Matrix Academy (interactive learning platform)
 * @author Your Name <you@example.com>
 * @copyright 2025 Presstronic Studios LLC
 */
/**
 * Storage service interface for file uploads
 * Allows swapping between different storage providers (S3, MinIO, etc.)
 */
export interface IStorageService {
  /**
   * Upload a file to storage
   * @param file - File buffer to upload
   * @param key - Storage key/path for the file
   * @param contentType - MIME type of the file
   * @returns Public URL of the uploaded file
   */
  uploadFile(file: Buffer, key: string, contentType: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param url - Public URL of the file to delete
   */
  deleteFile(url: string): Promise<void>;

  /**
   * Get the public URL for a file
   * @param key - Storage key/path of the file
   * @returns Public URL of the file
   */
  getFileUrl(key: string): string;
}
