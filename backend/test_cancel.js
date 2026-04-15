const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/users/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Login success!');

    const menusRes = await axios.get('http://localhost:5000/api/menu');
    const firstMenuId = menusRes.data[0]._id;

    const orderRes = await axios.post('http://localhost:5000/api/orders', {
      orderItems: [{ name: 'Test Coffee', qty: 1, image: '/placeholder.jpg', price: 5.99, product: firstMenuId }],
      totalPrice: 5.99,
      paymentMethod: 'UPI'
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Order created: ' + orderRes.data._id);

    const cancelRes = await axios.put(`http://localhost:5000/api/orders/${orderRes.data._id}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Cancel success: ', cancelRes.data.status);
  } catch(e) {
    console.error('Error:', e.response?.data?.message || e.message);
  }
}
test();
