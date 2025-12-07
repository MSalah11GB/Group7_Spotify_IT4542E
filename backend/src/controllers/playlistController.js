import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import playlistModel from '../models/playlistModel.js';
import songModel from '../models/songModel.js';
import { User } from '../models/userModel.js';

// Create a new playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, clerkId } = req.body;

    // Validate required fields
    if (!name) {
      return res.json({
        success: false,
        message: "Playlist name is required"
      });
    }

    if (!clerkId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find the user by clerkId
    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    // Process image if provided, or use default
    let imageUrl = "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"; // Default image

    if (req.file) {
      const imageFile = req.file;
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = imageUpload.secure_url;
    }

    // Create playlist data
    const playlistData = {
      name,
      description: description || "",
      image: imageUrl,
      creator: user._id,
      isPublic: isPublic !== undefined ? isPublic : true,
      songs: [],
      songCount: 0
    };

    // Save the playlist
    const playlist = new playlistModel(playlistData);
    await playlist.save();

    res.json({
      success: true,
      message: "Playlist created successfully",
      playlist
    });

  } catch (error) {
    console.error("Error creating playlist:", error);
    res.json({
      success: false,
      message: "An error occurred while creating the playlist"
    });
  }
};

// Get all playlists (with optional filtering)
const listPlaylists = async (req, res) => {
  try {
    const { clerkId, search, includePrivate } = req.query;

    let query = {};

    // If clerkId is provided, filter by creator
    if (clerkId) {
      const user = await User.findOne({ clerkId });
      if (user) {
        if (includePrivate === 'true') {
          // If includePrivate is true, get all playlists created by the user
          query.creator = user._id;
        } else {
          // Otherwise, get public playlists created by the user
          query = {
            $or: [
              { creator: user._id, isPublic: true },
              { creator: user._id, isPublic: { $exists: false } } // For backward compatibility
            ]
          };
        }
      } else {
        return res.json({
          success: false,
          message: "User not found"
        });
      }
    } else {
      // If no clerkId, only return public playlists
      query.isPublic = true;
    }

    // If search parameter is provided, filter by name or description
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get playlists and populate creator information
    const playlists = await playlistModel.find(query)
      .populate('creator', 'fullName imageURL clerkId')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      playlists
    });

  } catch (error) {
    console.error("Error listing playlists:", error);
    res.json({
      success: false,
      message: "An error occurred while fetching playlists"
    });
  }
};

// Get a single playlist by ID
const getPlaylist = async (req, res) => {
  try {
    const { id, clerkId } = req.query;

    if (!id) {
      return res.json({
        success: false,
        message: "Playlist ID is required"
      });
    }

    console.log(`Getting playlist with ID: ${id}, clerkId: ${clerkId || 'none'}`);

    // Find the playlist and populate songs and creator
    const playlist = await playlistModel.findById(id)
      .populate({
        path: 'songs',
        select: '_id name artist artistName album image file duration lrcFile' // Explicitly select all needed fields
      })
      .populate('creator', 'fullName imageURL clerkId');

    if (!playlist) {
      console.log(`Playlist not found with ID: ${id}`);
      return res.json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if the playlist is private and the user is not the creator
    if (!playlist.isPublic) {
      if (!clerkId) {
        return res.json({
          success: false,
          message: "This playlist is private"
        });
      }

      const user = await User.findOne({ clerkId });
      if (!user || !playlist.creator.equals(user._id)) {
        return res.json({
          success: false,
          message: "This playlist is private"
        });
      }
    }

    // Ensure songs array is valid
    if (!Array.isArray(playlist.songs)) {
      playlist.songs = [];
    }

    // Filter out any null or invalid songs
    const validSongs = playlist.songs.filter(song => song && song._id);

    // If some songs were invalid, update the count
    if (validSongs.length !== playlist.songs.length) {
      console.log(`Filtered out ${playlist.songs.length - validSongs.length} invalid songs from playlist`);
      playlist.songs = validSongs;
      playlist.songCount = validSongs.length;

      // Save the updated playlist
      await playlist.save();
    }

    console.log(`Successfully retrieved playlist with ${playlist.songs.length} songs`);

    res.json({
      success: true,
      playlist
    });

  } catch (error) {
    console.error("Error getting playlist:", error);
    res.json({
      success: false,
      message: "An error occurred while fetching the playlist"
    });
  }
};

// Update a playlist
const updatePlaylist = async (req, res) => {
  try {
    const { id, name, description, isPublic, clerkId } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Playlist ID is required"
      });
    }

    if (!clerkId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find the playlist
    const playlist = await playlistModel.findById(id);
    if (!playlist) {
      return res.json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if the user is the creator
    const user = await User.findOne({ clerkId });
    if (!user || !playlist.creator.equals(user._id)) {
      return res.json({
        success: false,
        message: "You don't have permission to update this playlist"
      });
    }

    // Create update data
    const updateData = {
      updatedAt: Date.now()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // If a new image is uploaded, process it
    if (req.file) {
      const imageFile = req.file;
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = imageUpload.secure_url;
    }

    // Update the playlist
    const updatedPlaylist = await playlistModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Playlist updated successfully",
      playlist: updatedPlaylist
    });

  } catch (error) {
    console.error("Error updating playlist:", error);
    res.json({
      success: false,
      message: "An error occurred while updating the playlist"
    });
  }
};

// Delete a playlist
const deletePlaylist = async (req, res) => {
  try {
    const { id, clerkId } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Playlist ID is required"
      });
    }

    if (!clerkId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }

    // Find the playlist
    const playlist = await playlistModel.findById(id);
    if (!playlist) {
      return res.json({
        success: false,
        message: "Playlist not found"
      });
    }

    // Check if the user is the creator
    const user = await User.findOne({ clerkId });
    if (!user || !playlist.creator.equals(user._id)) {
      return res.json({
        success: false,
        message: "You don't have permission to delete this playlist"
      });
    }

    // Delete the playlist
    await playlistModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Playlist deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.json({
      success: false,
      message: "An error occurred while deleting the playlist"
    });
  }
};

