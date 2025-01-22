import express from 'express'
import { createCollectionController, listACollectionController, listAllCollectionsController, retrieveAllVectors, retrieveSingleVectorController } from '../controllers/qdrantController';

const router = express.Router();

router.post('/addCollection', createCollectionController)
router.get('/listCollections', listAllCollectionsController)
router.get('/listACollection/:collectionName', listACollectionController)
router.get('/retrieveAllVectors/:collectionName', retrieveAllVectors)
router.get("/retrieveSingleVector/:collectionName/:vectorId", retrieveSingleVectorController)

export default router;