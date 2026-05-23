import Personal from '../../Models/Personal';
import Foto from '../../Models/FotoPersonal';
import Agenda from '../../Models/PersonalAgenda';
import AulaAgenda from '../../Models/AgendaAulas';
import Alunos from '../../Models/Alunos';
import Enderecos from '../../Models/Enderecos';

class PersonalControllers {
  async store(req, res) {
    try {
      const newUser = await Personal.create(req.body);
      const { id, nome, email } = newUser;
      return res.json({ id, nome, email });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async index(req, res) {
    try {
      // Seguindo o padrão Odata de seleção;
      const select = req.query.$select ? req.query.$select.split(',') : null;
      const expand = req.query.$expand ? req.query.$expand.split(',') : null;

      const options = {
        order: [['id', 'DESC']],
        include: [],
      };

      // Aqui você seleciona atributos de uma mesma tabela;
      if (select && select.length) {
        options.attributes = select;
      } else {
        options.attributes = ['id', 'nome', 'email'];
      }

      // Aqui ele é usado para consultar de outras tabelas;
      if (expand && expand.includes('foto')) {
        options.include.push({
          model: Foto,
          attributes: ['url', 'filename'],
          order: [['id', 'DESC']],
        });
      }

      if (expand && expand.includes('agenda')) {
        options.include.push({
          model: Agenda,
          attributes: ['id', 'personal_id', 'title', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
        });
      }

      if (expand && expand.includes('aulas')) {
        options.include.push({
          model: AulaAgenda,
          attributes: ['id', 'aluno_id', 'status', 'endereco', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
          include: [
            {
              model: Alunos,
              attributes: ['id', 'nome', 'email'],
            },
          ],
        });
      }

      if (expand && expand.includes('endereco')) {
        options.include.push({
          model: Enderecos,
          attributes: ['id', 'aluno_id', 'personal_id', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'],
          order: [['id', 'DESC']],
        });
      }

      const users = await Personal.findAll(options);
      return res.json(users);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async show(req, res) {
    try {
      const select = req.query.$select ? req.query.$select.split(',') : null;
      const expand = req.query.$expand ? req.query.$expand.split(',') : null;

      const options = {
        order: [['id', 'DESC']],
        include: [],
      };

      if (select && select.length) {
        options.attributes = select;
      } else {
        options.attributes = ['id', 'nome', 'email'];
      }

      if (expand && expand.includes('foto')) {
        options.include = [{
          model: Foto,
          attributes: ['url', 'filename'],
          order: [['id', 'DESC']],
        }];
      }

      if (expand && expand.includes('agenda')) {
        options.include.push({
          model: Agenda,
          attributes: ['id', 'personal_id', 'title', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
        });
      }

      if (expand && expand.includes('aulas')) {
        options.include.push({
          model: AulaAgenda,
          attributes: ['id', 'aluno_id', 'status', 'endereco', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
          include: [
            {
              model: Alunos,
              attributes: ['id', 'nome', 'email'],
            },
          ],
        });
      }

      if (expand && expand.includes('endereco')) {
        options.include.push({
          model: Enderecos,
          attributes: ['id', 'aluno_id', 'personal_id', 'rua', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'cep'],
          order: [['id', 'DESC']],
        });
      }

      const user = await Personal.findByPk(req.params.id, options);

      if (!user) {
        return res.status(400).json({
          errors: ['Usuário não encontrado em nossa base de dados'],
        });
      }

      return res.status(200).json(user);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async update(req, res) {
    try {
      if (!req.params.id) {
        return res.status(400).json({
          errors: ['Chave não enviada para update'],
        });
      }

      const personal = await Personal.findByPk(req.params.id);

      if (!personal) {
        return res.status(400).json({
          errors: ['Usuário não encontrado'],
        });
      }

      const novosDados = await personal.update(req.body);

      return res.status(200).json(novosDados);
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }
}

export default new PersonalControllers();
