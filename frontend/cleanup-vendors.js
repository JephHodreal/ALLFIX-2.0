import axios from 'axios';

const API_URL = 'http://localhost:8080/api/vendors';

async function cleanupVendors() {
  try {
    const res = await axios.get(API_URL);
    const vendors = res.data;
    
    for (const vendor of vendors) {
      if (vendor.services && vendor.services.length > 0) {
        console.log(`Clearing dummy services for vendor ${vendor.email || vendor.id}...`);
        await axios.put(`${API_URL}/${vendor.id}`, {
          ...vendor,
          services: []
        });
      }
    }
    console.log('Vendor cleanup complete!');
  } catch (err) {
    console.error('Error during vendor cleanup:', err.response?.data || err.message);
  }
}

cleanupVendors();
