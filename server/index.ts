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
    const files = stmt.all();
    res.json(files);
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
    const { originalname, path, mimetype, size } = req.file;
    const stmt = db.prepare(
      'INSERT INTO files (name, path, mimetype, size) VALUES (?, ?, ?, ?)'
    );
    const info = stmt.run(originalname, path, mimetype, size);

    const newFileStmt = db.prepare('SELECT * FROM files WHERE id = ?');
    const newFile = newFileStmt.get(info.lastInsertRowid);

    res.status(201).json(newFile);
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

        // Delete file from filesystem
        fs.unlink(file.path, (err) => {
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


app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Accessible on your network. You can now configure port forwarding.`);
});
