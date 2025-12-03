const express = require('express');
const router = express.Router();
const DataModel = require('../models/Data');

// 모든 데이터 조회
router.get('/', async (req, res) => {
  try {
    const data = await DataModel.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 특정 데이터 조회
router.get('/:id', async (req, res) => {
  try {
    const data = await DataModel.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('데이터 조회 오류:', error);
    res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
  }
});

// 데이터 생성
router.post('/', async (req, res) => {
  try {
    const { title, content, metadata } = req.body;
    
    const newData = new DataModel({
      title,
      content,
      metadata: metadata || {}
    });

    const savedData = await newData.save();
    res.status(201).json({ success: true, data: savedData });
  } catch (error) {
    console.error('데이터 생성 오류:', error);
    res.status(500).json({ error: '데이터 생성 중 오류가 발생했습니다.' });
  }
});

// 데이터 업데이트
router.put('/:id', async (req, res) => {
  try {
    const { title, content, metadata } = req.body;
    
    const updatedData = await DataModel.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content, 
        metadata,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: updatedData });
  } catch (error) {
    console.error('데이터 업데이트 오류:', error);
    res.status(500).json({ error: '데이터 업데이트 중 오류가 발생했습니다.' });
  }
});

// 데이터 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deletedData = await DataModel.findByIdAndDelete(req.params.id);
    
    if (!deletedData) {
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' });
    }

    res.json({ success: true, message: '데이터가 삭제되었습니다.' });
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
  }
});

module.exports = router;

