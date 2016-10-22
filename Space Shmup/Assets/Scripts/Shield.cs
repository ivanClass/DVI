using UnityEngine;
using System.Collections;

public class Shield : MonoBehaviour {
    public float rotationsPerSecond = 0.1f;
    public int levelShown = 0;

    // Use this for initialization
    void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
        // Read the current shield level from the Hero Singleton
        int currLevel = Mathf.FloorToInt(Hero.S.shieldLevel); // 1
        Renderer renderer = GetComponent<Renderer>();
        // If this is different from levelShown...
        if (renderer && levelShown != currLevel)
        {
            levelShown = currLevel;
            Material mat = renderer.material;
            // Adjust the texture offset to show different shield level
            mat.mainTextureOffset = new Vector2(0.2f * levelShown, 0); // 2
        }
        // Rotate the shield a bit every second
        float rZ = (rotationsPerSecond * Time.time * 360) % 360f; // 3
        transform.rotation = Quaternion.Euler(0, 0, rZ);
    }
}
