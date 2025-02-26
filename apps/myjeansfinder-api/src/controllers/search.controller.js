// Mock data for demo
const jeansData = [
  {
    id: 1,
    brand: 'Rag & Bone',
    style: 'Skinny',
    color: 'Black',
    wash: 'regular',
    size: '28',
    inseam: '30',
    description: 'Distressed, raw edge',
    price: 39.99,
  },
  {
    id: 2,
    name: 'Levis',
    style: '501',
    color: 'Blue',
    wash: 'medium',
    size: '32',
    inseam: '31',
    description: 'Classic, slim fit',
    price: 49.99,
  },
  {
    id: 3,
    name: 'Judy Blue',
    style: 'JB0878',
    color: 'Blue',
    wash: 'dark',
    size: '18',
    inseam: '31',
    description: 'skinny fit',
    price: 49.99,
  },
];

exports.searchJeans = (req, res) => {
  try {
    const { brand, minPrice, maxPrice, color } = req.query;

    // Filter jeans based on query parameters
    let results = [jeansData];

    if (brand) {
      results = results.filter((jeans) =>
        jean.brand.toLowerCase().includes(brand.toLowerCase())
      );
    }

    if (minPrice) {
      results = results.filter((jeans) => jeans.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      results = results.filter((jeans) => jeans.price <= parseFloat(maxPrice));
    }

    if (color) {
      results = results.filter((jeans) =>
        jeans.color.toLowerCase().includes(color.toLowerCase())
      );
    }

    res.status(200).json({
      message: 'Search successful',
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getJeansById = (req, res) => {
  try {
    const { id } = req.params; // Use req.params.id to get the jeans ID

    // Find the jeans by ID
    const jeans = jeansData.find((item) => item.id === parseInt(id));

    if (!jeans) {
      return res.status(404).json({ message: 'Jeans not found' });
    }

    res.status(200).json({
      message: 'Jeans found',
      jeans,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
