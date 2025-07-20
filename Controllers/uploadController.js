export const uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false, message: "No files uploaded"
      });
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`)
    res.status(200).json({ success: true, data: urls });
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: "Upload failed" });
  }
}
