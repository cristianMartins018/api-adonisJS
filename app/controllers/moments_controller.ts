import { cuid } from '@adonisjs/core/helpers';
import { HttpContext } from '@adonisjs/core/http';
import app from '@adonisjs/core/services/app'
import  fs  from 'fs';
import Moment from '#models/moment'

export default class MomentsController {
    private validationOptions = {
        type: ['image'],
        size: '2mb'
    }

    public async store({request, response}: HttpContext)
    {
        const body = request.body();
        const image = request.file('image', this.validationOptions);

        if(image)
        {
            const imageName = `${cuid()}.${image.extname}`;

            await image.move(app.makePath('uploads'),{
                name: imageName
            });
            body.image = imageName;
        }

        const moment = await Moment.create(body);

        response.status(201);

        return {
            msg: "Momento criado com sucesso!",
            data: moment
        }
    }

    public async index()
    {
        const moments = await Moment.query().preload("comments");
        return {
            data: moments
        }
    }

    public async show({params}: HttpContext)
    {
        const moment = await Moment.findOrFail(params.id);

        await moment.load('comments')

        return {
            data: moment
        }
    }

    public async destroy({params}: HttpContext)
    {
        const moment = await Moment.findOrFail(params.id);

        await moment.delete();

        return {
            msg: "Momento excluido com sucesso!",
            data: moment
        }
    }

    public async update({params, request}: HttpContext)
    {
        const body = request.body();
        const moment = await Moment.findOrFail(params.id);

        moment.title = body.title;
        moment.description = body.description;

        if (moment.image != body.image || !moment.image) {
            const image = request.file('image', this.validationOptions);
            const imageName = `${cuid()}.${image?.extname}`;
            await image?.move(app.makePath('uploads'), {
                name: imageName
            });
            moment.image = imageName;
        }
        await moment.save();

        return {
            msg: "Momento atualizado com sucesso!",
            data: moment
        }
    }

    public async getImage({params, response}: HttpContext)
    {
        const filePath = app.makePath(`uploads/${params.image}`);
        const fileExist = fs.existsSync(filePath);

        if(!fileExist)
        {
            return response.status(404).send('Imagem não encontrada!');
        }

        const ext = filePath.split('.').pop()?.toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') {
            mimeType = 'image/jpeg';
        } else {
            mimeType = 'image/png';
        }
        response.type(mimeType);
        const stream = fs.createReadStream(filePath);
        return response.stream(stream);
    } 
}