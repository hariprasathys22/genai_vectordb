import express from 'express';
import { QueryController } from '../controllers/QueryController';

const router = express.Router();


router.post('/querytext', QueryController)

export default router;