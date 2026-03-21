const DeliveryTask = require('../models/DeliveryTask');
const Finance = require('../models/Finance');

/*
Helper: check required fields
*/
const requireFields = (body, fields = []) => {
  return fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
};

/*
2) RIDER HISTORY
*/
exports.fetchAllTransportOrders = async (req,res)=>{
  try{
    const tasks = await DeliveryTask.findAll({
      where:{ rider_id: req.user.id },
      order:[['created_at','DESC']]
    });
    res.json({ success:true, count:tasks.length, data:tasks });
  }catch(err){
    res.status(500).json({ success:false, message:err.message })
  }
};

/*
3) GET CURRENT TASK
*/
exports.currentTask = async (req,res)=>{
  try{
    const task = await DeliveryTask.findByPk(req.params.orderId);
    if(!task) return res.status(404).json({ success:false, message:'Task not found' });
    res.json({ success:true, data:task });
  }catch(err){
    res.status(500).json({ success:false, message:err.message })
  }
};

/*
5) MARK IN TRANSIT
*/
exports.markInTransit = async (req,res)=>{
  try{
    const task = await DeliveryTask.findByPk(req.params.orderId);
    if(!task || task.rider_id !== req.user.id) {
      return res.status(403).json({ success:false, message:'Unauthorized' });
    }
    await task.update({ status:'out_for_delivery' }); // Matches ENUM
    res.json({ success:true, message:'In-Transit', data:task });
  }catch(err){
    res.status(500).json({ success:false, message:err.message })
  }
};

/*
7) CANCEL ORDER
*/
exports.cancelOrder = async (req,res)=>{
  try{
    const task = await DeliveryTask.findByPk(req.params.orderId);
    if(!task) return res.status(404).json({ success:false, message:'Not found' });
    await task.update({ status:'cancelled' });
    res.json({ success:true, message:'Cancelled', data:task });
  }catch(err){
    res.status(500).json({ success:false, message:err.message })
  }
};

/*
8) UPDATE ORDER
*/
exports.updateOrderDetails = async (req,res)=>{
  try{
    const task = await DeliveryTask.findByPk(req.params.orderId);
    if(!task) return res.status(404).json({ success:false, message:'Not found' });
    await task.update(req.body);
    res.json({ success:true, data:task });
  }catch(err){
    res.status(500).json({ success:false, message:err.message })
  }
};

/*
0) CREATE ORDER (Task)
POST /api/orders
*/
exports.createOrder = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['packageNumber', 'order_id', 'pickUp', 'dropOff']);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing fields: ${missing.join(', ')}`
      });
    }

    const existing = await DeliveryTask.findOne({
      where: { package_number: req.body.packageNumber }
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'packageNumber already exists' });
    }

    // Mapping nested frontend objects to the flat DB schema
    const task = await DeliveryTask.create({
      package_number: req.body.packageNumber,
      order_id: req.body.order_id,
      requirement: req.body.requirement || '',
      estimated_delivery_time: req.body.estimatedDeliveryTime || '',
      distance: req.body.distance ?? 0,
      charges: req.body.charges ?? 0,
      status: 'pending',
      accept_status: false,
      rider_id: null,
      
      // Pickup mapping
      pickup_location: req.body.pickUp.location,
      pickup_lat: req.body.pickUp.lat,
      pickup_lng: req.body.pickUp.long || req.body.pickUp.lng,
      pickup_contact: req.body.pickUp.docContact,
      
      // Dropoff mapping
      dropoff_location: req.body.dropOff.location,
      dropoff_lat: req.body.dropOff.lat,
      dropoff_lng: req.body.dropOff.long || req.body.dropOff.lng,
      receiver_contact: req.body.dropOff.receiverContact,
      
      delivery_zone: req.body.deliveryZone || null
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
1) GET INCOMING ORDERS
*/
exports.getIncomingDelivery = async (req, res) => {
  try {
    const tasks = await DeliveryTask.findAll({
      where: {
        accept_status: false,
        status: 'pending'
      },
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
4) ACCEPT ORDER
*/
exports.acceptOrder = async (req, res) => {
  try {
    const task = await DeliveryTask.findByPk(req.params.orderId);

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (task.accept_status) {
      return res.status(409).json({ success: false, message: 'Task already accepted' });
    }

    await task.update({
      accept_status: true,
      status: 'accepted',
      rider_id: req.user.id
    });

    res.json({ success: true, message: 'Task accepted', data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
6) MARK DELIVERED
*/
exports.markDelivered = async (req, res) => {
  try {
    const task = await DeliveryTask.findByPk(req.params.orderId);

    if (!task || task.rider_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized or not found' });
    }

    // Update Task Status
    await task.update({ 
      status: 'delivered', 
      delivered_at: new Date() 
    });

    // Credit Rider Finance
    const amount = Number(task.charges || 0);
    if (amount > 0) {
      let finance = await Finance.findOne({ where: { user_id: req.user.id } });

      if (!finance) {
        finance = await Finance.create({
          user_id: req.user.id,
          balance: 0,
          trend: [],
          recentPayouts: [],
          transactionHistory: []
        });
      }

      const history = [...(finance.transaction_history || finance.transactionHistory || [])];
      const trend = [...(finance.trend || [])];

      history.unshift({ 
        transType: 'Credit', 
        amount: amount, 
        reference: task.package_number,
        date: new Date() 
      });
      trend.push(amount);

      await finance.update({
        balance: finance.balance + amount,
        transaction_history: history,
        trend: trend.slice(-12)
      });
    }

    res.json({ success: true, message: 'Delivered and rider credited', data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
9) GET ACCEPTED TASKS FOR CURRENT RIDER
*/
exports.getDeliveredByRider = async (req, res) => {
  try {
    const riderId = req.user.id;

    const tasks = await DeliveryTask.findAll({
      where: {
        rider_id: riderId,
        status: 'delivered',
        accept_status: true
      },
      order: [['updated_at', 'DESC']]
    });

    return res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

      exports.getActiveTask = async (req, res) => {
        try {
          const task = await DeliveryTask.findOne({
            where: {
              rider_id: req.user.id,
              accept_status: true,
              status: ['assigned', 'accepted', 'picked_up', 
      'out_for_delivery'
]
            },
            order: [['created_at', 'DESC']]
          });
      
          if (!task) {
            return res.json({ success: true, data: null });
          }
      
          res.json({ success: true, data: task });
      
        } catch (err) {
          res.status(500).json({ success: false, message: err.message });
        }
      };