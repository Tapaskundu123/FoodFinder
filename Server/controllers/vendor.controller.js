import { UserModel } from '../Models/User.models.js';
import axios from 'axios';

export const stallDetails = async (req, res) => {
  const { stallName, foodType, city, phoneNumber, location } = req.body;
  const id = req.user.id;

  try {
    if (!stallName || !foodType || !city || !phoneNumber || !location) {
      return res.status(400).json({ success: false, message: "Missing details!" });
    }
    const user = await UserModel.findById(id);
    user.set({ stallName, foodType, city, phoneNumber, location });
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'FoodFinder Vendor Details',
      text: `Your stall details have been saved at FoodFinder.`
    };
    await transporter.sendMail(mailOption);

    return res.status(200).json({ success: true, message: "Details added successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export const findNearbyVendors = async (req, res) => {
  const { latitude, longitude, maxDistance = 5000, city, foodType, foodCategory, foodItem } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
  }

  try {
    let query = { role: 'vendor' };
    if (city) query.city = city;
    if (foodType) query.foodType = foodType;
    // Note: foodCategory and foodItem require a menu schema
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    };

    const vendors = await UserModel.find(query).select('name stallName city phoneNumber foodType location');

    const origins = [`${latitude},${longitude}`];
    const destinations = vendors.map(vendor => `${vendor.location.coordinates[1]},${vendor.location.coordinates[0]}`);

    let vendorsWithDistance = vendors.map(vendor => ({
      name: vendor.name,
      stallName: vendor.stallName,
      city: vendor.city,
      phoneNumber: vendor.phoneNumber,
      foodType: vendor.foodType,
      latitude: vendor.location.coordinates[1],
      longitude: vendor.location.coordinates[0],
      distance: 'Unknown',
      duration: 'Unknown'
    }));

    if (destinations.length > 0) {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origins.join('|'),
          destinations: destinations.join('|'),
          key: process.env.GOOGLE_MAPS_API_KEY,
          units: 'metric'
        }
      });

      if (response.data.status === 'OK') {
        vendorsWithDistance = vendors.map((vendor, index) => {
          const distanceData = response.data.rows[0].elements[index];
          return {
            name: vendor.name,
            stallName: vendor.stallName,
            city: vendor.city,
            phoneNumber: vendor.phoneNumber,
            foodType: vendor.foodType,
            latitude: vendor.location.coordinates[1],
            longitude: vendor.location.coordinates[0],
            distance: distanceData.distance?.text || 'Unknown',
            duration: distanceData.duration?.text || 'Unknown'
          };
        });
      }
    }

    return res.status(200).json({ success: true, vendors: vendorsWithDistance });
  } catch (err) {
    console.error('Error finding nearby vendors:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};