from PIL import Image
import numpy as np
from scipy.ndimage import label

def clean_illustration():
    # Load the original image
    img = Image.open('/Users/ethyldevera/ALLFIX-2.0/frontend/public/images/cleaning-illustration.original.png')
    data = np.array(img)
    h, w, c = data.shape
    
    # Create a mask for modification
    modified_data = data.copy()
    
    # 1. Remove small isolated features (like stars/sparkles)
    # We label all opaque components (alpha > 0)
    opaque_mask = data[:, :, 3] > 0
    labeled, num_features = label(opaque_mask)
    
    for i in range(1, num_features + 1):
        feat_size = np.sum(labeled == i)
        if feat_size < 300: # Small isolated components (stars)
            modified_data[labeled == i] = [0, 0, 0, 0]
            print(f"Removed small component {i} of size {feat_size}")

    # Refresh the mask of remaining pixels
    remaining_mask = modified_data[:, :, 3] > 0
    
    # 2. Identify and remove the soft white crescent glow and light gray highlights
    # These are very light pixels (white or very close to white)
    # Color range: R, G, B all >= 210
    light_pixels = (modified_data[:,:,0] >= 210) & (modified_data[:,:,1] >= 210) & (modified_data[:,:,2] >= 210) & remaining_mask
    modified_data[light_pixels] = [0, 0, 0, 0]
    print(f"Removed {np.sum(light_pixels)} light/white background pixels (crescent glow/sparkles)")

    # 3. Identify and remove the bottom gray platform/line
    # The platform is situated at the bottom (Y >= 750)
    # Let's target the gray colors and the platform lines in this Y-range
    remaining_mask = modified_data[:, :, 3] > 0
    
    # Gray platform colors usually have R, G, B close to each other in the range 90-180
    gray_platform = (
        (modified_data[:,:,0] >= 90) & (modified_data[:,:,0] <= 180) &
        (modified_data[:,:,1] >= 90) & (modified_data[:,:,1] <= 180) &
        (modified_data[:,:,2] >= 90) & (modified_data[:,:,2] <= 180) &
        (np.abs(modified_data[:,:,0].astype(int) - modified_data[:,:,1].astype(int)) <= 15) &
        (np.abs(modified_data[:,:,1].astype(int) - modified_data[:,:,2].astype(int)) <= 15) &
        remaining_mask
    )
    
    # Apply Y-range filter for the gray platform to avoid touching the subjects' gray parts higher up
    # The platform is at Y >= 750 (the base line of the illustration)
    platform_bottom = (np.indices((h, w))[0] >= 750) & gray_platform
    modified_data[platform_bottom] = [0, 0, 0, 0]
    print(f"Removed {np.sum(platform_bottom)} gray platform pixels at the bottom (Y >= 750)")
    
    # Additional cleanup: remove any light-colored pixels at the bottom
    bottom_light = (np.indices((h, w))[0] >= 750) & (modified_data[:,:,0] >= 180) & (modified_data[:,:,1] >= 180) & (modified_data[:,:,2] >= 180) & (modified_data[:,:,3] > 0)
    modified_data[bottom_light] = [0, 0, 0, 0]
    print(f"Removed {np.sum(bottom_light)} bottom light-colored helper pixels")

    # Save the modified image
    new_img = Image.fromarray(modified_data)
    new_img.save('/Users/ethyldevera/ALLFIX-2.0/frontend/public/images/cleaning-illustration.png')
    print("Background removal complete and saved!")

if __name__ == '__main__':
    clean_illustration()
