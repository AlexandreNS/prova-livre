// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/admin`
  | `/admin/categories`
  | `/admin/categories/:categoryId`
  | `/admin/categories/:categoryId/basic`
  | `/admin/categories/:categoryId/subcategories`
  | `/admin/login`
  | `/admin/profile`
  | `/admin/profile/password`

export type Params = {
  '/admin/categories/:categoryId': { categoryId: string }
  '/admin/categories/:categoryId/basic': { categoryId: string }
  '/admin/categories/:categoryId/subcategories': { categoryId: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
