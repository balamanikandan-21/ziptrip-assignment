import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from '../controllers/todosController.js';

const router = Router();

router.get('/', asyncHandler(listTodos));
router.post('/', asyncHandler(createTodo));
router.get('/:id', asyncHandler(getTodo));
router.put('/:id', asyncHandler(updateTodo));
router.delete('/:id', asyncHandler(deleteTodo));

export default router;
