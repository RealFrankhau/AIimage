# Supabase Storage Setup Instructions

## Create Private Storage Bucket

1. Go to your Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `works`
4. **Important**: Uncheck "Public bucket" (make it private)
5. Click "Create bucket"

## Set Up Storage Policies

After creating the bucket, go to the bucket's "Policies" tab and create the following policies:

### Policy 1: Users can upload their own images
```sql
CREATE POLICY "Users can upload own images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'works' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Policy 2: Users can view their own images
```sql
CREATE POLICY "Users can view own images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'works' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Policy 3: Users can update their own images
```sql
CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'works' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'works' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

### Policy 4: Users can delete their own images
```sql
CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'works' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

## Alternative: Using Supabase Dashboard UI

If you prefer using the UI instead of SQL:

1. Go to Storage → works bucket → Policies
2. Click "New Policy" for each operation (INSERT, SELECT, UPDATE, DELETE)
3. Use "Custom policy" with the following expressions:

**For INSERT:**
- Policy name: `Users can upload own images`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy expression: `bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]`

**For SELECT:**
- Policy name: `Users can view own images`
- Allowed operation: `SELECT`
- Target roles: `authenticated`
- Policy expression: `bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]`

**For UPDATE:**
- Policy name: `Users can update own images`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- Policy expression: `bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]`

**For DELETE:**
- Policy name: `Users can delete own images`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- Policy expression: `bucket_id = 'works' AND auth.uid()::text = (storage.foldername(name))[1]`

## Verify Setup

1. Try uploading an image through the app
2. Check that the image is stored in `works/{user_id}/{uuid}.{ext}`
3. Verify that signed URLs work for viewing images
4. Confirm that users cannot access other users' images

## File Size Limits

The bucket should have a file size limit configured. In the bucket settings:
- Set "File size limit" to 10MB (10485760 bytes)
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## CORS Configuration (if needed)

If you encounter CORS issues when uploading from the browser, configure CORS in Supabase:
1. Go to Settings → API
2. Add your domain to "Additional allowed origins"
3. Or configure CORS on the bucket level if needed