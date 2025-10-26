import router from '@adonisjs/core/services/router'

import '#controllers/comments_controller'

router.group(() => {
  router.get('/get-image/:image', '#controllers/moments_controller.getImage')
  router.resource('/moments', '#controllers/moments_controller').apiOnly()
  router.post('/moments/:momentId/comments', '#controllers/comments_controller.store')
}).prefix('/api')
