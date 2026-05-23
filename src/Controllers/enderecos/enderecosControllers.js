import Enderecos from '../../Models/Enderecos';
import Alunos from '../../Models/Alunos';
import Personal from '../../Models/Personal';

const ENDERECO_ATTRIBUTES = [
  'id',
  'aluno_id',
  'personal_id',
  'rua',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'estado',
  'cep',
];

const PERFIS = {
  aluno: {
    campo: 'aluno_id',
    model: Alunos,
    nome: 'aluno',
  },
  personal: {
    campo: 'personal_id',
    model: Personal,
    nome: 'personal',
  },
};

const perfilInformado = (id) => id !== undefined && id !== null && id !== '';

class EnderecosControllers {
  async storeByPerfil(req, res, tipoPerfil) {
    try {
      const perfil = PERFIS[tipoPerfil];
      const perfilId = req.userID;

      if (!perfilInformado(perfilId)) {
        return res.status(401).json({
          errors: ['Login obrigatório para cadastrar endereço.'],
        });
      }

      const usuario = await perfil.model.findByPk(perfilId);

      if (!usuario) {
        return res.status(404).json({
          errors: [`Nenhum ${perfil.nome} foi encontrado com o id ${perfilId}.`],
        });
      }

      const enderecoExistente = await Enderecos.findOne({
        where: { [perfil.campo]: perfilId },
        attributes: ['id', perfil.campo],
      });

      if (enderecoExistente) {
        return res.status(409).json({
          errors: [`Já existe um endereço vinculado a este ${perfil.nome}.`],
          data: {
            endereco_id: enderecoExistente.id,
            tipo_perfil: tipoPerfil,
            perfil_id: perfilId,
          },
        });
      }

      const dadosEndereco = {
        ...req.body,
        aluno_id: null,
        personal_id: null,
        [perfil.campo]: perfilId,
      };

      const endereco = await Enderecos.create(dadosEndereco);

      return res.status(201).json({
        message: `Endereço cadastrado com sucesso para o ${perfil.nome}.`,
        data: endereco,
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async storeAluno(req, res) {
    return this.storeByPerfil(req, res, 'aluno');
  }

  async storePersonal(req, res) {
    return this.storeByPerfil(req, res, 'personal');
  }

  async store(req, res) {
    return res.status(400).json({
      errors: [
        'Cadastro de endereço deve usar o usuário logado. Use POST /enderecos/aluno ou POST /enderecos/personal.',
      ],
    });
  }

  async show(req, res) {
    try {
      const endereco = await Enderecos.findByPk(req.params.id, {
        attributes: ENDERECO_ATTRIBUTES,
      });

      if (!endereco) {
        return res.status(404).json({
          errors: [`Nenhum endereço foi encontrado com o id ${req.params.id}.`],
        });
      }

      return res.status(200).json({
        message: 'Endereço encontrado com sucesso.',
        data: endereco,
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async showByPerfil(req, res) {
    try {
      const { tipo, id } = req.params;
      const tipoPerfil = String(tipo).toLowerCase();
      const perfil = PERFIS[tipoPerfil];

      if (!perfil) {
        return res.status(400).json({
          errors: ['Tipo de perfil inválido. Use "aluno" ou "personal".'],
        });
      }

      const usuario = await perfil.model.findByPk(id, {
        attributes: ['id'],
      });

      if (!usuario) {
        return res.status(404).json({
          errors: [`Nenhum ${perfil.nome} foi encontrado com o id ${id}.`],
        });
      }

      const endereco = await Enderecos.findOne({
        where: { [perfil.campo]: id },
        attributes: ENDERECO_ATTRIBUTES,
      });

      if (!endereco) {
        return res.status(404).json({
          errors: [`Nenhum endereço foi encontrado para este ${perfil.nome}.`],
        });
      }

      return res.status(200).json({
        message: 'Endereço encontrado com sucesso.',
        data: endereco,
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async update(req, res) {
    try {
      if (!req.params.id) {
        return res.status(404).json({
          errors: ['Chave não enviada para update'],
        });
      }

      const endereco = await Enderecos.findByPk(req.params.id);

      if (!endereco) {
        return res.status(400).json({
          errors: ['Endereço não encontrado'],
        });
      }

      const novosDados = await endereco.update(req.body);

      return res.status(200).json({
        message: 'Endereço atualizado com sucesso.',
        data: novosDados,
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }

  async delete(req, res) {
    try {
      if (!req.params.id) {
        return res.status(404).json({
          errors: ['Chave não enviada para delete'],
        });
      }

      const endereco = await Enderecos.findByPk(req.params.id);

      if (!endereco) {
        return res.status(400).json({
          errors: ['Endereço não encontrado'],
        });
      }

      await endereco.destroy();

      return res.status(200).json({
        message: 'Endereço excluído com sucesso.',
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors?.map((err) => err.message) || [e.message],
      });
    }
  }
}

export default new EnderecosControllers();
