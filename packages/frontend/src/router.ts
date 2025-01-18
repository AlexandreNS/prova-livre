// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/admin`
  | `/admin/categories`
  | `/admin/categories/:categoryId`
  | `/admin/categories/:categoryId/basic`
  | `/admin/categories/:categoryId/subcategories`
  | `/admin/classes`
  | `/admin/classes/:classId`
  | `/admin/classes/:classId/basic`
  | `/admin/classes/:classId/students`
  | `/admin/login`
  | `/admin/profile`
  | `/admin/profile/password`
  | `/admin/questions`
  | `/admin/questions/:questionId`
  | `/admin/questions/:questionId/basic`
  | `/admin/questions/:questionId/categories`
  | `/admin/questions/:questionId/options`
  | `/admin/students`
  | `/admin/students/:studentId`
  | `/admin/students/:studentId/basic`

export type Params = {
  '/admin/categories/:categoryId': { categoryId: string }
  '/admin/categories/:categoryId/basic': { categoryId: string }
  '/admin/categories/:categoryId/subcategories': { categoryId: string }
  '/admin/classes/:classId': { classId: string }
  '/admin/classes/:classId/basic': { classId: string }
  '/admin/classes/:classId/students': { classId: string }
  '/admin/questions/:questionId': { questionId: string }
  '/admin/questions/:questionId/basic': { questionId: string }
  '/admin/questions/:questionId/categories': { questionId: string }
  '/admin/questions/:questionId/options': { questionId: string }
  '/admin/students/:studentId': { studentId: string }
  '/admin/students/:studentId/basic': { studentId: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
