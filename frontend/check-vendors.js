import axios from 'axios';

async function checkVendors() {
  try {
    const res = await axios.get('http://localhost:8080/api/vendors');
    const vendors = res.data;
    console.log(`Found ${vendors.length} vendors in DB:`);
    for (const v of vendors) {
      console.log(`- ID: ${v.id}, UID: ${v.uid}, Email: ${v.email}, Name: ${v.name || v.company_name}`);
    }
  } catch (err) {
    console.error('Error fetching vendors:', err.message);
  }
}

checkVendors();
