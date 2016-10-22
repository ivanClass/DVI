using UnityEngine;
using System.Collections;
public class DelegateExample : MonoBehaviour
{
    // Create a delegate definition named FloatOperationDelegate
    // This defines the parameter and return types for target functions
    public delegate float FloatOperationDelegate(float f0, float f1);
    // FloatAdd must have the same parameter and return types as
    // FloatOperationDelegate
    public float FloatAdd(float f0, float f1)
    {
        float result = f0 + f1;
        print("The sum of " + f0 + " & " + f1 + " is " + result + ".");
        return (result);
    }
    // FloatMultiply must have the same parameter and return types as well
    public float FloatMultiply(float f0, float f1)
    {
        float result = f0 * f1;
        print("The product of " + f0 + " & " + f1 + " is " + result + ".");
        return (result);
    }
    // Declare a field "fod" of the type FloatOperationDelegate
    public FloatOperationDelegate fod; // A delegate field
    void Awake()
    {
        // Assign the method FloatAdd() to fod
        fod = FloatAdd;
        // Add the method FloatMultiply(), now BOTH are called by fod
        fod += FloatMultiply;
        // Check to see whether fod is null before calling
        if (fod != null)
        {
            // Call fod(3,4); it calls FloatAdd(3,4) & then FloatMultiply(3,4)
            float result = fod(3, 4);
            // Prints: The sum of 3 & 4 is 7.
            // then Prints: The product of 3 & 4 is 12.
            print(result);
            // Prints: 12
            // Thie result is 12 because the last target method to be called
            // is the one that returns a value via the delegate.
        }
    }
}
