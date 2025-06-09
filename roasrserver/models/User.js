const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    business_name: { type: String },
    post: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    workers: [{ type: String }],
    datas: {
        green_kava_work: {
            type: [
              {
                name: { type: String },
                varaiti:{type:String},
                country: { type: String },
                region: { type: String },
                date: { type: String },
                lotNumber: { type: Number },
                lotId: { type: Number },
                comment:{type:String},
                volume:{type:String},
                price:{type:String},
                packing:{type:String},
                processing:{type:String},
                arrive:{type:String},
                maybearrive:{type:String},
                status:{type:String},
                roasting:{type:String},
                batch_size:{type:String},
                capping:{type:String},
                roasting_time:{type:String},
                operations:[{
                  weight:{type:String},
                  date:{type:String},
                  price:{type:String},
                  author:{type:String}
                }],
                author:{type:String},
                globalWeight:{type:Number},
                globalRoastWeight:{type:Number,default:0},
                packingArray:{type:Array}
              },
            ],

            default: [],
          },
          green_kava_sklad: {
            type: [
              {
                name: { type: String },
                varaiti:{type:String},
                country: { type: String },
                region: { type: String },
                date: { type: String },
                lotNumber: { type: Number },
                lotId: { type: Number },
                comment:{type:String},
                volume:{type:String},
                price:{type:String},
                packing:{type:String},
                processing:{type:String},
                arrive:{type:String},
                status:{type:String}
              },
            ],
            default: [],
          },
          big_direct_kava:{
            type:[{
              lots_inside:{type: Array},
              lot_number:{type:Number},
              lot_name:{type:String},
              date:{type:String},
              delivery_status:{type:String},
              deliver_time:{type:String},
              author:{type:String},
            }],
            default:[],
          },
          roast_kava: {
            type: {
              to_roast: { type: [Object], default: [] }, // Массив объектов для запланированной обжарки
              in_roast:{ type: [Object], default: [] },
              roasted: { type: [Object], default: [] },  // Массив объектов для уже обжаренного кофе
            },
            default: {} // Указываем, что по умолчанию это пустой объект
          },
          additions: {
            type: {
              packs: { type: [Object], default: [] }, // Массив объектов для запланированной обжарки
              stretch:{ type: [Object], default: [] },
              stickers: { type: [Object], default: [] },  // Массив объектов для уже обжаренного кофе
            },
            default: {} // Указываем, что по умолчанию это пустой объект
          },
          pack_kava: {
            type: [
              {
                name: { type: String },
                lotId: { type: Number },
                lots_inside:{type: Array},
                globalPackWeight:{type:Number,default:0},
              },
            ],

            default: [],
          },


},
    bossPost: { type: String }, // Email босса
    access: {
      one: {
        first: { type: Boolean, default: false },
        second: { type: Boolean, default: false },
        label: {
          first: { type: String, default: 'Статистика' },
          second: { type: String, default: 'Переоблік' },
          third: { type: String, default: 'Керування' }
        }
      },
      two: {
        first: { type: Boolean, default: false },
        second: { type: Boolean, default: false },
        label: {
          first: { type: String, default: 'Замовлення' },
          second: { type: String, default: 'Склад' },
          third: { type: String, default: 'Зелена кава' }
        }
      },
      three: {
        first: { type: Boolean, default: false },
        second: { type: Boolean, default: false },
        label: {
          first: { type: String, default: 'Робоча' },
          second: { type: String, default: 'Склад' },
          third: { type: String, default: 'Обсмажка' }
        }
      },
      four: {
        first: { type: Boolean, default: false },
        second: { type: Boolean, default: false },
        label: {
          first: { type: String, default: 'Робоча' },
          second: { type: String, default: 'Склад' },
          third: { type: String, default: 'Фасовка' }
        }
      },
      five: {
        first: { type: Boolean, default: false },
        second: { type: Boolean, default: false },
        label: {
          first: { type: String, default: 'Робоча' },
          second: { type: String, default: 'Склад' },
          third: { type: String, default: 'Додаткові поставки' }
          
        }
      }
    },
    addition:{type:Array},
    shifts:{type:Array},
    shift_status:{type:Boolean},
    appointments:{type:Array},
    styles:{
      background_color:{type:String ,default:"basic"},
      main_text_color:{type:String,default:"basic"},
      secondary_text_color:{type:String,default:"basic"},
      head_text_color:{type:String,default:"basic"},
      senders:{type:Boolean,default:true}
    },
    own_roles: {
      type: Array,
      default: []
    }
  }, { strict: false });
  

// {
//   role_name:"Roaster ",
//   role_id:"тут на сервере генерируем и подставляем ид",
//   author:"тут передаем юзера",
//   access:{
//     green_kava:{
//       postavka:false,
//       work:false,
//       sklad:false
//     },
//     roasted:{
//       work:false,
//       sklad:false,
//     },
//     packing:{
//       work:false,
//       sklad:false,
//     },
//     addition:{
//       work:false,
//       sklad:false
//     },
//     statistic:{
//       green_kava:{
//         global:false
//       }
//       roasted:{
//         global:false
//       },
//       packing{
//         global:false
//       },
//       addition{
//         global:false
//       }
//     },
//     settings:{
//       role_offer:false,
//       workers_offer:false,
//     }
//   }
// }

const User = mongoose.model('User', UserSchema);
module.exports = User;
