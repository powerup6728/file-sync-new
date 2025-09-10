import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db, { initDb } from './db';

// Initialize Database
try {
  initDb();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// API Routes
app.get('/api/files', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM files ORDER BY createdAt DESC');
    const files = stmt.all() as { id: number; name: string; path: string; mimetype: string; size: number; createdAt: string }[];
    
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `/uploads/${path.basename(file.path)}`
    }));

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Failed to fetch files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const { originalname, filename, mimetype, size } = req.file;
    // Store filename instead of the full path
    const stmt = db.prepare(
      'INSERT INTO files (name, path, mimetype, size) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(originalname, filename, mimetype, size);

    const newFileStmt = db.prepare('SELECT * FROM files WHERE id = ?');
    const newFile = newFileStmt.get(info.lastInsertRowid) as { id: number; name: string; path: string; mimetype: string; size: number; createdAt: string };

    res.status(201).json({
        ...newFile,
        url: `/uploads/${newFile.path}`
    });
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).json({ error: 'Failed to save file information' });
  }
});

app.delete('/api/files/:id', (req, res) => {
    const { id } = req.params;
    try {
        const fileStmt = db.prepare('SELECT path FROM files WHERE id = ?');
        const file = fileStmt.get(id) as { path: string } | undefined;

        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Reconstruct the full path for deletion
        const fullPath = path.join(uploadsDir, file.path);

        // Delete file from filesystem
        fs.unlink(fullPath, (err) => {
            if (err) {
                // Log error but proceed to delete from DB anyway
                console.error('Failed to delete file from filesystem:', err);
            }
        });

        // Delete file from database
        const deleteStmt = db.prepare('DELETE FROM files WHERE id = ?');
        const info = deleteStmt.run(id);

        if (info.changes > 0) {
            res.status(200).json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found in database' });
        }
    } catch (error) {
        console.error('Failed to delete file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
