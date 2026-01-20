import type {NextFunction, Response} from 'express'

// --- Middleware d'autorisation ---
export function requireAdmin(req: Express.Request, res: Response, next: NextFunction)
{
    if (!req.user || req.user.role !== 'admin')
    {
        return res.status(403).json({error: 'Accès réservé aux administrateurs'})
    }
    next()
}

export function requireEditor(req: Express.Request, res: Response, next: NextFunction)
{
    if (!req.user || (req.user.role !== 'editor' && req.user.role !== 'admin'))
    {
        return res.status(403).json({error: 'Accès réservé aux éditeurs/administrateurs'})
    }
    next()
}
