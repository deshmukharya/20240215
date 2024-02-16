const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

/**
 * GET endpoint to retrieve all products from the data.json file.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/search', async (req, res) => {
  try {
    const data = await fs.readFile('./data.json', 'utf-8');
    const { products } = JSON.parse(data);

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST endpoint to add a new product to the data.json file.
 * @param {Object} req - Express request object with product details in the request body
 * @param {Object} res - Express response object
 */
app.post('/products', async (req, res) => {
  try {
    let jsonData;
    try {
      const data = await fs.readFile('./data.json', 'utf-8');
      jsonData = JSON.parse(data);
    } catch (readError) {
      console.error('Error reading data.json:', readError);
      jsonData = { products: {} };
    }

    const newProductId = Object.keys(jsonData.products).length + 1;
    const newProduct = req.body;

    jsonData.products[newProductId] = newProduct;

    await fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), 'utf-8');

    res.status(201).json({ id: newProductId, ...newProduct });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


/**
 * POST endpoint to make a new order and add it to the orders.json file.
 * @param {Object} req - Express request object with order details in the request body
 * @param {Object} res - Express response object
 */
app.post('/order', async (req, res) => {
  try {
    let ordersData = [];
    
    try {
      const data = await fs.readFile('./orders.json', 'utf-8');
      ordersData = JSON.parse(data);
    } catch (readError) {
      // If the file doesn't exist or is not valid JSON, it will be an empty array
    }

    const newOrderId = ordersData.length + 1;
    const newOrder = req.body;

    ordersData.push({ id: newOrderId, ...newOrder });

    await fs.writeFile('./orders.json', JSON.stringify(ordersData, null, 2), 'utf-8');

    res.status(201).json({ id: newOrderId, ...newOrder });
  } catch (error) {
    console.error('Error reading or updating orders.json:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET endpoint to retrieve all orders from the orders.json file.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/status', async (req, res) => {
  try {
    const data = await fs.readFile('./orders.json', 'utf-8');
    const ordersData = JSON.parse(data);

    res.status(200).json(ordersData);
  } catch (error) {
    console.error('Error reading orders.json:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * DELETE endpoint to remove an order by its ID from the orders.json file.
 * @param {Object} req - Express request object with order ID in the route parameter
 * @param {Object} res - Express response object
 */
app.delete('/order/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    const data = await fs.readFile('./orders.json', 'utf-8');
    let ordersData = JSON.parse(data);

    const orderIndex = ordersData.findIndex(order => order.id === orderId);

    if (orderIndex !== -1) {
      ordersData.splice(orderIndex, 1);

      await fs.writeFile('./orders.json', JSON.stringify(ordersData, null, 2), 'utf-8');

      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error reading or updating orders.json:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * PUT endpoint to update the price of a product by its ID in the data.json file.
 * @param {Object} req - Express request object with product ID in the query parameter and new price in the request body
 * @param {Object} res - Express response object
 */
app.put('/products/update-price', async (req, res) => {
  try {
    const productId = parseInt(req.query.id);
    const { newPrice } = req.body;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid or missing product ID' });
    }

    const data = await fs.readFile('./data.json', 'utf-8');
    const jsonData = JSON.parse(data);

    const productToUpdate = jsonData.products.find(product => product && product.id === productId);

    if (productToUpdate) {
      productToUpdate.price = newPrice;

      await fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), 'utf-8');

      res.status(200).json(productToUpdate);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error changing product price:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

/**
 * DELETE endpoint to remove a product by its ID from the data.json file.
 * @param {Object} req - Express request object with product ID in the query parameter
 * @param {Object} res - Express response object
 */
app.delete('/products/delete', async (req, res) => {
  try {
    const productId = parseInt(req.query.id);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid or missing product ID' });
    }

    const data = await fs.readFile('./data.json', 'utf-8');
    const jsonData = JSON.parse(data);

    const productIndex = jsonData.products.findIndex(product => product && product.id === productId);

    if (productIndex !== -1) {
      jsonData.products.splice(productIndex, 1);

      await fs.writeFile('./data.json', JSON.stringify(jsonData, null, 2), 'utf-8');

      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});








