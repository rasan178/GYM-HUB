// Handle webpack hot-update requests
export default function handler(req, res) {
  const { path } = req.query;
  
  // Check if it's a webpack hot-update request
  if (path && path[0] && path[0].includes('webpack.hot-update.json')) {
    res.status(200).json({});
    return;
  }
  
  // For other webpack requests, return 404
  res.status(404).json({ message: 'Not found' });
}
