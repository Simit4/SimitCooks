import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


async function testPermissions() {
            console.log('Testing permissions...');
            
            // Test table access
            const { data: tableData, error: tableError } = await supabase
                .from('gallery_metadata')
                .select('*')
                .limit(5);
            
            if (tableError) {
                console.error('❌ Table access error:', tableError);
                console.log('Error details:', tableError.message);
            } else {
                console.log('✅ Table access successful!');
                console.log('Data:', tableData);
            }
            
            // Test storage access
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('gallery')
                .list();
            
            if (storageError) {
                console.error('❌ Storage access error:', storageError);
                console.log('Error details:', storageError.message);
            } else {
                console.log('✅ Storage access successful!');
                console.log('Files:', storageData);
            }
            
            // Test getting a public URL
            if (storageData && storageData.length > 0) {
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('gallery')
                    .getPublicUrl(storageData[0].name);
                console.log('Sample public URL:', publicUrl);
            }
        }
        
        testPermissions();
