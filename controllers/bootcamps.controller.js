const Bootcamp = require('../models/Bootcamp');

exports.getAll = async (req, res, nex) => {
    try {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({
            success: true,
            count: bootcamps.length,
            data: bootcamps
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

exports.get = async (req, res, nex) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({
            success: true,
            data: bootcamp
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

exports.create = async (req, res, nex) => {
    try {
        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            syccess: require,
            data: bootcamp
        });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

exports.update = async (req, res, nex) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: bootcamp });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}

exports.remove = async (req, res, nex) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false });
    }
}