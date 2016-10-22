using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class Hero : MonoBehaviour {
    static public Hero S; //Singleton

    public float speed = 30;
    public float rollMult = -45;
    public float pitchMult = 30;

    [SerializeField]
    private float _shieldLevel = 1; // Add the underscore!
    public Bounds bounds;

    public float gameRestartDelay = 2f;

    // Declare a new delegate type WeaponFireDelegate
    public delegate void WeaponFireDelegate();

    // Create a WeaponFireDelegate field named fireDelegate.
    public WeaponFireDelegate fireDelegate;
    public Weapon[] weapons;

    // Use this for initialization
    void Start () {
        // Reset the weapons to start _Hero with 1 blaster
        ClearWeapons();
        weapons[0].SetType(WeaponType.blaster);
    }
	
	// Update is called once per frame
	void Update () {
        // Pull in information from the Input class
        float xAxis = Input.GetAxis("Horizontal"); // 1
        float yAxis = Input.GetAxis("Vertical"); // 1
                                                 // Change transform.position based on the axes
        Vector3 pos = transform.position;
        pos.x += xAxis * speed * Time.deltaTime;
        pos.y += yAxis * speed * Time.deltaTime;
        transform.position = pos;

        transform.position = pos;
        bounds.center = transform.position;
        Vector3 off = Utils.ScreenBoundsCheck(bounds, BoundsTest.onScreen);
        if (off != Vector3.zero)
        {
            pos -= off;
            transform.position = pos;
        }
        // Rotate the ship to make it feel more dynamic // 2

        transform.rotation = Quaternion.Euler(yAxis * pitchMult, xAxis * rollMult, 0);
        // Use the fireDelegate to fire Weapons
        // First, make sure the Axis("Jump") button is pressed
        // Then ensure that fireDelegate isn't null to avoid an error
        if (Input.GetAxis("Jump") == 1 && fireDelegate != null)
        { // 1
            fireDelegate();
        }


    }

    void Awake()
    {
        S = this; // Set the Singleton
        bounds = Utils.CombineBoundsOfChildren(this.gameObject);


    }
    public GameObject lastTriggerGo = null;
    void OnTriggerEnter2D(Collider2D other)
    {
        GameObject go = Utils.FindTaggedParent(other.gameObject);
        

        // If there is a parent with a tag
        if (go != null)
        {
            if (go == lastTriggerGo)
            {
                return;
            }
            lastTriggerGo = go;
            if (go.tag == "Enemy")
            {
                // If the shield was triggered by an enemy
                // Decrease the level of the shield by 1
                shieldLevel--;
                // Destroy the enemy
                Destroy(go);
            }
            else if (go.tag == "PowerUp")
            {
                // If the shield was triggerd by a PowerUp
                AbsorbPowerUp(go);
            }
            else
            {
                print("Triggered: " + go.tag);
            }

        }
        else
        {
            // Otherwise announce the original other.gameObject
            print("Triggered: aaaaaaaaaaaaaaaaaa " + other.gameObject.name);
        }

    }

    [SerializeField]
    public float shieldLevel
    {
        get
        {
            return (_shieldLevel);
        }
        set
        {
            _shieldLevel = Mathf.Min(value, 4);
            // If the shield is going to be set to less than zero
            if (value < 0)
            {
                Destroy(this.gameObject);
                // Tell Main.S to restart the game after a delay
                Main.S.DelayedRestart(gameRestartDelay);

            }
        }
    }
    public void AbsorbPowerUp(GameObject go)
    {
        PowerUp pu = go.GetComponent<PowerUp>();
        switch (pu.type)
        {
            case WeaponType.shield: // If it's the shield
                shieldLevel++;
                break;
            default: // If it's any Weapon PowerUp
                     // Check the current weapon type
                if (pu.type == weapons[0].type)
                {
                    // then increase the number of weapons of this type
                    Weapon w = GetEmptyWeaponSlot(); // Find an available weapon
                    if (w != null)
                    {
                        w.SetType(pu.type);
                    }
                }
                else
                {
                    // If this is a different weapon
                    ClearWeapons();
                    weapons[0].SetType(pu.type);
                }
                break;
        }
        pu.AbsorbedBy(this.gameObject);
    }                       // Set it to pu.type
    Weapon GetEmptyWeaponSlot()
    {
        for (int i = 0; i < weapons.Length; i++)
        {
            if (weapons[i].type == WeaponType.none)
            {
                return (weapons[i]);
            }
        }
        return (null);
    }
    void ClearWeapons()
    {
        foreach (Weapon w in weapons)
        {
            w.SetType(WeaponType.none);
        }
    }

}
