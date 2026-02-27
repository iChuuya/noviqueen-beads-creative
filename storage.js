// ===================================
// Supabase Storage Configuration
// ===================================
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'product-images';

// ===================================
// Storage Functions
// ===================================

/**
 * Upload an image file to Supabase Storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - The file name
 * @param {string} mimeType - The MIME type (e.g., 'image/jpeg')
 * @returns {Promise<{success: boolean, url: string, error?: string}>}
 */
async function uploadImage(fileBuffer, fileName, mimeType) {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(uniqueFileName, fileBuffer, {
                contentType: mimeType,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(uniqueFileName);

        return {
            success: true,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} imageUrl - The full image URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteImage(imageUrl) {
    try {
        // Extract filename from URL
        // URL format: https://qimfwyvymbybvttohyny.supabase.co/storage/v1/object/public/product-images/filename.jpg
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        if (!fileName) {
            return { success: false, error: 'Invalid image URL' };
        }

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (error) {
            console.error('Supabase delete error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if URL is a Supabase Storage URL
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
function isSupabaseUrl(url) {
    return url && url.includes('supabase.co/storage');
}

module.exports = {
    uploadImage,
    deleteImage,
    isSupabaseUrl,
    supabase
};
