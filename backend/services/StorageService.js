import supabase from '../config/databaseConnect.js';

class StorageService {
  
  async uploadFile(filePath, fileBuffer, upsert = false) {
    try {
      const options = {
        contentType: 'text/plain'
      };

      if (upsert) {
        options.upsert = true;
      }

      const { error } = await supabase.storage
        .from('problems')
        .upload(filePath, fileBuffer, options);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Upload file error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download a file from Supabase storage
   */
  async downloadFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('problems')
        .download(filePath);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Download file error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete a file from Supabase storage
   */
  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from('problems')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        // Don't throw error for file deletion as it might not exist
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, message: error.message };
    }
  }

}

export { StorageService };
