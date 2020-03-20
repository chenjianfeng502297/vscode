(function (Vue) { //表示依赖了全局的 Vue, 其实不加也可以，只是更加明确点

   var STORAGE_KEY = 'items-vuejs';
    
   // 本地存储数据对象
   const itemStorage = {
      fetch: function () { // 获取本地数据
         return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      },
      save: function (items) { // 保存数据到本地
         localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
   }

   //初始化任务
   const items = []
	//注册全局指令
	//指令名不要加上v-, 在引用这个指令时才需要加上 v-
	Vue.directive('app-focus', {
		inserted (el, binding) {
			//聚集元素
			el.focus()
		}
	})
    
   var app = new Vue({
      el: '#todoapp',
       
      data: {
         //items,   // 对象属性简写，等价于items: items
         items: itemStorage.fetch(), //获取本地数据进行初始化
         currentItem: null, //上面不要少了逗号，接收当前点击的任务项
         filterStatus: 'all' // 上面不要少了逗号，接收变化的状态值
      },
       
      // 监听器
      watch: {
         // 如果 items 发生改变，这个函数就会运行
         items: {
            deep: true, // 发现对象内部值的变化, 要在选项参数中指定 deep: true。
            handler: function(newItems, oldItems) {
               //本地进行存储
               itemStorage.save(newItems)
            }
         }
      },

      //自定义局部指令
       directives : {
           'todo-focus': { //注意指令名称
               update (el, binding) {
                   //只有双击的那个元素才会获取焦点
                   if(binding.value) {
                       el.focus()
                   }
               }
           }
       },

      // 定义计算属性选项
      computed: {
         // 过滤出不同状态数据
         filterItems () {
            //this.filterStatus 作为条件，变化后过滤不同数据
            switch (this.filterStatus) {
               case "active": // 过滤出未完成的数据
                  return this.items.filter( item => !item.completed)
                  break
               case "completed": // 过滤出已完成的数据
                  return this.items.filter( item => item.completed)
                  break
               default: // 其他，返回所有数据
                  return this.items
            }
         },
         // 复选框计算属性
         toggleAll : {
            get () { //等价于 get : functon () {...}
               console.log(this.remaining)
               //2. 当 this.remaining 发生变化后，会触发该方法运行
               // 当所有未完成任务数为 0 , 表示全部完成, 则返回 true 让复选框选中
               //反之就 false 不选中
               return this.remaining === 0
            },
            set (newStatus) {
               // console.log(=)
               //1. 当点击 checkbox 复选框后状态变化后，就会触发该方法运行,
               // 迭代出数组每个元素,把当前状态值赋给每个元素的 completed
               this.items.forEach((item) => {
                  item.completed = newStatus
               })
            }
         },
          // 过滤出所有未完成的任务项
          remaining () {
              /*
                return this.items.filter(function (item) {
                    return !item.completed
                }).length
                */
              //ES6 箭头函数
              return this.items.filter(item => !item.completed).length
          }
      }, // **注意** 后面不要少了逗号 ，

      methods: {
         //编辑完成
         finishEdit (item, index, event) {
            const content = event.target.value.trim();
            // 1. 如果为空, 则进行删除任务项
            if (!event.target.value.trim()){
               //重用 removeItem 函数进行删除
               this.removeItem(index)
               return
            }
            // 2. 添加数据到任务项中
            item.content = content
            // 3. 移除 .editing 样式
            this.currentItem = null
         },

         //取消编辑
         cancelEdit () {
            // 移除样式
            this.currentItem = null
         },

         // 进入编辑状态,当前点击的任务项item赋值currentItem，用于页面判断显示 .editing
         toEdit (item) {
            this.currentItem = item
         },
         //移除所有已完成任务项
         removeCompleted () {
            // 过滤出所有未完成的任务，重新赋值数组即可
            this.items = this.items.filter(item => !item.completed)
         },

         // 移除任务项
         removeItem (index) {
            // 移除索引为index的一条记录
            this.items.splice(index, 1)
         },

         //增加任务项
         addItem (event) { //对象属性函数简写，等价于addItem: function () {
            console.log('addItem', event.target.value)
            //1. 获取文本框输入的数据
            const content = event.target.value.trim()
            //2. 判断数据如果为空，则什么都不做
            if (!content.length) {
               return
            }
            //3.如果不为空，则添加到数组中
            //  生成id值
            const id = this.items.length + 1
            //  添加到数组中
            this.items.push({
               id, //等价于 id:id
               content,
               completed: false
            })
            //4. 清空文本框内容
            event.target.value = ''
         }
      }
   })

   //当路由 hash 值改变后会自动调用此函数
   window.onhashchange = function () {
      console.log('hash改变了' + window.location.hash)
      // 1.获取点击的路由 hash , 当截取的 hash 不为空返回截取的，为空时返回 'all'
      var hash = window.location.hash.substr(2) || 'all'

      // 2. 状态一旦改变，将 hash 赋值给 filterStatus
      //    当计算属性 filterItems  感知到 filterStatus 变化后，就会重新过滤
      //    当 filterItems 重新过滤出目标数据后，则自动同步更新到视图中
      app.filterStatus = hash
   }
   // 第一次访问页面时,调用一次让状态生效
   window.onhashchange()

})(Vue);