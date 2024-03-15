import { motion } from "framer-motion";

import './index.css';

function CheekiBreekiEffect() {
    return (
        <div className='cheeki-breeki'>
            <motion.div
                className="block"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.25 }}
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
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
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
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.30 }}
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
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 1 }}
            >
                <img
                    alt={'killa'}
                    loading="lazy"
                    src={`${process.env.PUBLIC_URL}/images/killa.png`}
                />
            </motion.div>
            <motion.div
                className="block"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.25 }}
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
