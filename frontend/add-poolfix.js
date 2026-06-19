import axios from 'axios';

const API_URL = 'http://localhost:8080/api/services';

const poolFixService = {
  name: 'PoolFix',
  description: 'Professional pool cleaning, maintenance, and repair services that keep your pool crystal clear and swim-ready.',
  tagline: 'PoolFix Services',
  sub: [
    { name: 'Pool Cleaning', description: 'Professional pool cleaning services that keep your pool sparkling, balanced, and ready to enjoy.' },
    { name: 'Pool Repair', description: 'Identifies and fixes water leaks in pool walls, plumbing, and equipment to prevent water loss and structural damage.' },
  ],
};

async function addPoolFix() {
  try {
    console.log(`Creating ${poolFixService.name}...`);
    const createRes = await axios.post(API_URL, {
      name: poolFixService.name,
      description: poolFixService.description,
      tagline: poolFixService.tagline,
      imageUrl: ''
    });
    const newId = createRes.data.id || createRes.data.name;

    for (const sub of poolFixService.sub) {
      console.log(`  Adding subservice ${sub.name}...`);
      await axios.post(`${API_URL}/${newId}/subservices`, {
        name: sub.name,
        description: sub.description,
        imageUrl: '',
        workTypes: [],
        prices: {}
      });
    }
    
    console.log('Added PoolFix successfully!');
  } catch (err) {
    console.error('Error adding PoolFix:', err.response?.data || err.message);
  }
}

addPoolFix();
