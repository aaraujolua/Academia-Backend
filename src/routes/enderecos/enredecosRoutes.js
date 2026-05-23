import { Router } from 'express';
import enderecosControllers from '../../Controllers/enderecos/enderecosControllers';
import alunoLoginRequired from '../../middlewares/alunoLoginRiquered';
import personalLoginRequired from '../../middlewares/personalLoginRiquered';

const routes = Router();

routes.post('/aluno', alunoLoginRequired, (req, res) => enderecosControllers.storeAluno(req, res));
routes.post('/personal', personalLoginRequired, (req, res) => enderecosControllers.storePersonal(req, res));
routes.post('/', enderecosControllers.store);
routes.get('/:tipo/:id', enderecosControllers.showByPerfil);
routes.get('/:id', enderecosControllers.show);
routes.put('/:id', enderecosControllers.update);
routes.delete('/:id', enderecosControllers.delete);

export default routes;
