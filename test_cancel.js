async function test() {
  try {
    const email = `test${Date.now()}@test.com`;
    const loginRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    if(!token) throw new Error('No token ' + JSON.stringify(loginData));
    console.log('Register success!');

    const menuRes = await fetch('http://localhost:5000/api/menu');
    const menuData = await menuRes.json();
    const firstMenuId = menuData[0]._id;

    const orderRes = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        orderItems: [{ name: 'Test Coffee', qty: 1, image: '/placeholder.jpg', price: 5.99, product: firstMenuId }],
        totalPrice: 5.99,
        paymentMethod: 'UPI'
      })
    });
    const orderData = await orderRes.json();
    console.log('Order created: ' + orderData._id);
    console.log('order.createdAt:', orderData.createdAt);
    console.log('Date.now() on client:', Date.now());
    console.log('parsed time:', new Date(orderData.createdAt).getTime());

    const cancelRes = await fetch(`http://localhost:5000/api/orders/${orderData._id}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    const cancelData = await cancelRes.json();
    if(cancelRes.ok) {
        console.log('Cancel success: ', cancelData.status);
    } else {
        console.error('Cancel failed: ', cancelData);
    }
  } catch(e) {
    console.error('Error:', e);
  }
}
test();
