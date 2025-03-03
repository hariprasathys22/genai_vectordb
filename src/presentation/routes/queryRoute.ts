import express from 'express';
import { chatHistoryController, QueryController } from '../controllers/QueryController';

const router = express.Router();


router.post('/querytext/:collectionName', QueryController)
router.post('/chatHistory', chatHistoryController)

export default router;