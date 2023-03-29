import { motion } from 'framer-motion';

import './index.css';

function CheekiBreekiEffect() {
    return (
        <div className="cheeki-breeki">
            <motion.div
                className="block"
                animate={{ rotate: 360 }}
                transition={{ yoyo: Infinity, duration: 0.25 }}
            >
                <img
                    alt={'killa'}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/killa.png`}
                />
            </motion.div>
            <motion.div
                className="block"
                animate={{ scale: 4 }}
                transition={{ yoyo: Infinity, duration: 1 }}
            >
                <img
                    alt={'killa'}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/killa.png`}
                />
            </motion.div>
            <motion.div
                className="block"
                animate={{ rotate: 360, scale: 4, x: -100 }}
                transition={{ yoyo: Infinity, duration: 0.3 }}
            >
                <img
                    alt={'killa'}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/killa.png`}
                />
            </motion.div>
            <motion.div
                className="block"
                animate={{ scale: 4 }}
                transition={{ yoyo: Infinity, duration: 1 }}
            >
                <img
                    alt={'killa'}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/killa.png`}
                />
            </motion.div>
        </div>
    );
}

export default CheekiBreekiEffect;
