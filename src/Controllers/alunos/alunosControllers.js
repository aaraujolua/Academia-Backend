import Aluno from '../../Models/Alunos';
import Foto from '../../Models/FotoAlunos';
import AulaAgenda from '../../Models/AgendaAulas';
import Personal from '../../Models/Personal';
import Enderecos from '../../Models/Enderecos';
import ClienteService from '../../services/pagamento/cliente_service';
import Cobrancas from '../../Models/Cobranca';
import PlanosPersonal from '../../Models/PlanosPersonal';

class AlunoControllers {
 async store(req, res) {
    try {
      const dadosAluno = req.body;

      // Cria o aluno no banco
      const novoAluno = await Aluno.create(dadosAluno);

      const { id, nome, email } = novoAluno;
      return res.status(201).json({ id, nome, email});
    } catch (e) {
      console.error('Erro ao criar aluno:', e);
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async index(req, res) {
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
        options.include.push({
          model: Foto,
          attributes: ['url', 'filename'],
          order: [['id', 'DESC']],
        });
      }

      if (expand && expand.includes('aulas')) {
        options.include.push({
          model: AulaAgenda,
          attributes: ['id', 'personal_id', 'endereco', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
          include: [
            {
              model: Personal,
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

      if (expand && expand.includes('cobrancas')) {
        options.include.push({
          model: Cobrancas,
          order: [['id', 'DESC']],
          include: [
            {
              model: PlanosPersonal,
              attributes: ['id', 'tipo_plano', 'valor'],
            },
          ],
        });
      }

      const users = await Aluno.findAll(options);

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

      if (expand && expand.includes('aulas')) {
        options.include.push({
          model: AulaAgenda,
          attributes: ['id', 'personal_id', 'status', 'endereco', 'date_init', 'date_end'],
          order: [['id', 'DESC']],
          include: [
            {
              model: Personal,
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

      if (expand && expand.includes('cobrancas')) {
        options.include.push({
          model: Cobrancas,
          order: [['id', 'DESC']],
          include: [
            {
              model: PlanosPersonal,
              attributes: ['id', 'tipo_plano', 'valor'],
            },
          ],
        });
      }

      const user = await Aluno.findByPk(req.params.id, options);

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
      const { id } = req.params;
      const { cpfCnpj } = req.body;

      if (!id) {
        return res.status(400).json({
          errors: ['ID do aluno não informado.'],
        });
      }

      const aluno = await Aluno.findByPk(id);

      if (!aluno) {
        return res.status(404).json({
          errors: ['Aluno não encontrado.'],
        });
      }

      // Não permite informar/alterar CPF se o aluno já possui um cadastrado
      if (cpfCnpj && aluno.cpf_cnpj) {
        return res.status(400).json({
          errors: ['Este aluno já possui CPF/CNPJ cadastrado e ele não pode ser alterado.'],
        });
      }

      // Não permite usar um CPF/CNPJ que já exista no banco para outro aluno
      if (cpfCnpj) {
        const cpfExistente = await Aluno.findOne({
          where: { cpf_cnpj: cpfCnpj },
        });

        if (cpfExistente && String(cpfExistente.id) !== String(id)) {
          return res.status(400).json({
            errors: ['CPF/CNPJ já cadastrado no banco.'],
          });
        }
      }

      const dadosAtualizados = { ...req.body };

      // Mapeia camelCase -> snake_case
      if (cpfCnpj) {
        dadosAtualizados.cpf_cnpj = cpfCnpj;
      }

      delete dadosAtualizados.cpfCnpj;

      const alunoAtualizado = await aluno.update(dadosAtualizados);

      return res.status(200).json({
        message: 'Dados do aluno atualizados com sucesso.',
        data: alunoAtualizado,
      });
    } catch (e) {
      console.error('Erro geral na atualização do aluno:', e);
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }
}

export default new AlunoControllers();
