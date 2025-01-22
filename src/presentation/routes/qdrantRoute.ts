import express from 'express'
import { createCollectionController } from '../controllers/qdrantController';

const router = express.Router();

router.post('/addCollection', createCollectionController)

export default router;