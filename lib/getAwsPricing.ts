// Types for pricing data
type PricingTerm = {
  OnDemand: number;
  Reserved: number;
  Spot: number;
};

type OperatingSystemPricing = {
  Linux: PricingTerm;
  Windows: PricingTerm;
};

type RegionPricing = {
  'us-east-1': OperatingSystemPricing;
};

type InstancePricing = {
  [key: string]: RegionPricing;
};

// Static pricing lookup table for common EC2 instance types
const EC2_PRICING: InstancePricing = {
  't2.micro': {
    'us-east-1': {
      'Linux': {
        'OnDemand': 0.0116,
        'Reserved': 0.0069,
        'Spot': 0.0035
      },
      'Windows': {
        'OnDemand': 0.0166,
        'Reserved': 0.0119,
        'Spot': 0.0085
      }
    }
  },
  't2.small': {
    'us-east-1': {
      'Linux': {
        'OnDemand': 0.023,
        'Reserved': 0.0138,
        'Spot': 0.007
      },
      'Windows': {
        'OnDemand': 0.033,
        'Reserved': 0.0238,
        'Spot': 0.017
      }
    }
  },
  't3.micro': {
    'us-east-1': {
      'Linux': {
        'OnDemand': 0.0104,
        'Reserved': 0.0062,
        'Spot': 0.0031
      },
      'Windows': {
        'OnDemand': 0.0154,
        'Reserved': 0.0112,
        'Spot': 0.008
      }
    }
  },
  'm5.large': {
    'us-east-1': {
      'Linux': {
        'OnDemand': 0.096,
        'Reserved': 0.0576,
        'Spot': 0.0288
      },
      'Windows': {
        'OnDemand': 0.106,
        'Reserved': 0.0676,
        'Spot': 0.0388
      }
    }
  },
  'c5.large': {
    'us-east-1': {
      'Linux': {
        'OnDemand': 0.085,
        'Reserved': 0.051,
        'Spot': 0.0255
      },
      'Windows': {
        'OnDemand': 0.095,
        'Reserved': 0.061,
        'Spot': 0.0355
      }
    }
  }
};

export async function getAwsPricing(params: {
  serviceCode: string;
  instanceType: string;
  location: string;
  operatingSystem: string;
  tenancy: string;
  termType: string;
}) {
  const { instanceType, location, operatingSystem, termType } = params;

  try {
    // Get base price from lookup table
    const basePrice = EC2_PRICING[instanceType]?.[location as keyof RegionPricing]?.[operatingSystem as keyof OperatingSystemPricing]?.[termType as keyof PricingTerm] || 0.0116; // Default to t2.micro Linux OnDemand price

    return {
      terms: {
        OnDemand: {
          [termType]: {
            priceDimensions: {
              [termType]: {
                description: `${instanceType} ${operatingSystem} ${termType} Instance`,
                pricePerUnit: {
                  USD: basePrice.toString()
                },
                unit: 'Hrs'
              }
            }
          }
        }
      }
    };
  } catch (error) {
    console.error("Error getting AWS pricing:", error);
    throw error;
  }
}

export function formatPricingInfo(priceData: any) {
  if (!priceData) return null;

  try {
    const terms = priceData.terms.OnDemand || {};
    const term = Object.values(terms)[0] as any;
    const priceDimensions = term.priceDimensions;
    const priceDimension = Object.values(priceDimensions)[0] as any;

    return {
      description: priceDimension.description,
      pricePerUnit: parseFloat(priceDimension.pricePerUnit.USD),
      unit: priceDimension.unit
    };
  } catch (error) {
    console.error("Error formatting pricing info:", error);
    return null;
  }
} 