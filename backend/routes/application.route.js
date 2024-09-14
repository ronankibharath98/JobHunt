import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { applyJob, getApplications, getApplicants, updateApplication } from '../controllers/application.controller.js';

const router = express.Router();

router.route('/apply/:id').get(isAuthenticated, applyJob);
router.route('/get').get(isAuthenticated, getApplications);
router.route('/:id/applicants').get(isAuthenticated, getApplicants);
router.route('/status/:id/update').put(isAuthenticated, updateApplication);

export default router; 