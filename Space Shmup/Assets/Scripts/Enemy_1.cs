using UnityEngine;
using System.Collections;

public class Enemy_1 : Enemy {

    public float waveFrequency = 2;

    public float waveWidth = 4;
    public float waveRotY = 45;

    public float x0 = -12345; //posición x inicial
    public float birthTime;

	// Use this for initialization
	void Start () {
        x0 = pos.x;
        birthTime = Time.time;
    }
	


    public override void Move(){
        // Because pos is a property, you can't directly set pos.x
        // so get the pos as an editable Vector3
        Vector3 tempPos = pos;
        // theta adjusts based on time
        float age = Time.time - birthTime;
        float theta = Mathf.PI * 2 * age / waveFrequency;
        float sin = Mathf.Sin(theta);
        tempPos.x = x0 + waveWidth * sin;
        pos = tempPos;
        // rotate a bit about y
        Vector3 rot = new Vector3(0, sin * waveRotY, 0);
        this.transform.rotation = Quaternion.Euler(rot);
        // base.Move() still handles the movement down in y
        base.Move();
    }
}
