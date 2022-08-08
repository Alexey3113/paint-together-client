import React from 'react'

interface IButton {
    onClick?: (e: any) => void,
    title: string,
    myStyles?: string
}

import styles from "./Button.module.scss"

const Button: React.FC<IButton> = ({onClick, title, myStyles}) => {
  return (
    <button className={`${styles.button} ${myStyles}`} onClick={onClick} >
        {title}
    </button>
  )
}

export default Button